import Phaser from 'phaser'
import gameEventBridge from '../GameEventBridge'
import { createPlayer, updatePlayerVelocity, preloadPlayerAssets, findNearestObject } from '../systems/PlayerSystem'

// Types for scene state
interface SceneState {
  player: Phaser.GameObjects.Sprite | null
  skillNPCs: Phaser.GameObjects.Group | null
  portals: Phaser.GameObjects.Group | null
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null
  interactionPrompt: Phaser.GameObjects.Text | null
  nearestNPC: Phaser.GameObjects.GameObject | null
  nearestPortal: Phaser.GameObjects.GameObject | null
}

interface SkillData {
  id: string
  name: string
  emoji: string
  x: number
  y: number
  category: string
}

interface PortalData {
  id: string
  name: string
  targetScene: string
}

// Pure functions for scene logic
const createSkillsData = (): SkillData[] => [
  { id: 'frontend', name: 'Frontend Dev', emoji: '💻', x: 300, y: 300, category: 'frontend' },
  { id: 'backend', name: 'Backend Dev', emoji: '⚙️', x: 600, y: 300, category: 'backend' },
  { id: 'mobile', name: 'Mobile Dev', emoji: '📱', x: 900, y: 300, category: 'mobile' },
  { id: 'devops', name: 'DevOps', emoji: '🚀', x: 450, y: 500, category: 'devops' },
  { id: 'design', name: 'UI/UX Design', emoji: '🎨', x: 750, y: 500, category: 'design' }
]

const createPortalsData = (width: number, height: number): Array<PortalData & { x: number; y: number; color: number; emoji: string }> => [
  {
    id: 'forest',
    name: 'Project Forest',
    targetScene: 'ProjectForestScene',
    x: 50,
    y: height / 2,
    color: 0x27ae60,
    emoji: '🌲'
  },
  {
    id: 'tower',
    name: 'Résumé Tower',
    targetScene: 'ResumeTowerScene',
    x: width - 50,
    y: height / 2,
    color: 0x8e44ad,
    emoji: '🏰'
  }
]

// Factory functions for creating game objects

const createSkillNPC = (scene: Phaser.Scene, skill: SkillData, onInteract: (skillId: string) => void): Phaser.GameObjects.Container => {
  const npc = scene.add.container(skill.x, skill.y)
  
  const npcBody = scene.add.rectangle(0, 0, 48, 48, 0x9b59b6, 0.8)
  const npcEmoji = scene.add.text(0, -8, skill.emoji, { fontSize: '24px' }).setOrigin(0.5)
  const npcLabel = scene.add.text(0, 35, skill.name, { 
    fontSize: '12px', 
    color: '#2c3e50',
    align: 'center'
  }).setOrigin(0.5)

  npc.add([npcBody, npcEmoji, npcLabel])
  scene.physics.add.existing(npc, true)
  
  npc.setData('skillData', skill)
  npc.setData('isNPC', true)
  npc.setSize(48, 48)
  npc.setInteractive()
  npc.on('pointerdown', () => onInteract(skill.id))
  
  return npc
}

const createPortal = (
  scene: Phaser.Scene, 
  portalData: PortalData & { x: number; y: number; color: number; emoji: string },
  onActivate: (sceneName: string) => void
): Phaser.GameObjects.Container => {
  const portal = scene.add.container(portalData.x, portalData.y)
  
  portal.add([
    scene.add.rectangle(0, 0, 60, 80, portalData.color, 0.7),
    scene.add.text(0, -10, portalData.emoji, { fontSize: '24px' }).setOrigin(0.5),
    scene.add.text(0, 15, portalData.name.replace(' ', '\n'), { 
      fontSize: '10px', 
      align: 'center', 
      color: '#ffffff' 
    }).setOrigin(0.5)
  ])
  
  scene.physics.add.existing(portal, true)
  portal.setData('portalData', { 
    id: portalData.id, 
    name: portalData.name, 
    targetScene: portalData.targetScene 
  })
  portal.setData('isPortal', true)
  portal.setSize(60, 80)
  portal.setInteractive()
  portal.on('pointerdown', () => {
    onActivate(portalData.targetScene)
  })
  
  return portal
}

const setupWorldBackground = (scene: Phaser.Scene): void => {
  const { width, height } = scene.scale

  scene.add.rectangle(width / 2, height / 2, width, height, 0x3498db, 0.3)
  
  scene.add.text(width / 2, 60, '🏘️ Skill Village', {
    fontSize: '32px',
    color: '#2c3e50',
    fontStyle: 'bold'
  }).setOrigin(0.5)

  scene.add.text(width / 2, 120, 'Walk around and interact with NPCs to explore my skills!', {
    fontSize: '18px',
    color: '#34495e'
  }).setOrigin(0.5)

  // Decorative elements
  const decorations = [
    { emoji: '🏠', x: 100, y: 200 },
    { emoji: '🏠', x: width - 100, y: 200 },
    { emoji: '🌳', x: 200, y: height - 200 },
    { emoji: '🌳', x: width - 200, y: height - 200 }
  ]
  
  decorations.forEach(({ emoji, x, y }) => {
    scene.add.text(x, y, emoji, { fontSize: '40px' })
  })
}

/**
 * Skill Village Scene - Interactive area showcasing technical skills
 * NPCs represent different skill categories and technologies
 */
export class SkillVillageScene extends Phaser.Scene {
  private state: SceneState = {
    player: null,
    skillNPCs: null,
    portals: null,
    cursors: null,
    interactionPrompt: null,
    nearestNPC: null,
    nearestPortal: null
  }

  constructor() {
    super({ key: 'SkillVillageScene' })
  }

  preload(): void {
    preloadPlayerAssets(this)
  }

  create(): void {
    // Initialize scene using functional approach
    this.initializeScene()
    
    // Global click detection
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Click detection for debugging if needed
    })
    
    // Mouse movement tracking  
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Mouse movement tracking for debugging if needed
    })
    
    // Start this scene as the initial scene
    this.scene.setActive(true)
  }

  private initializeScene(): void {
    const { width, height } = this.scale
    
    // Setup world background
    setupWorldBackground(this)
    
    // Create player
    this.state.player = createPlayer(this, width / 2, height / 2)
    
    // Create skill NPCs
    this.state.skillNPCs = this.add.group()
    const skills = createSkillsData()
    skills.forEach(skill => {
      const npc = createSkillNPC(this, skill, this.handleSkillInteraction)
      this.state.skillNPCs!.add(npc)
    })
    
    // Setup controls
    this.setupControls()
    
    // Create UI elements
    this.setupUI()
    
    // Create portals
    this.state.portals = this.add.group()
    const portalsData = createPortalsData(width, height)
    portalsData.forEach(portalData => {
      const portal = createPortal(this, portalData, this.handleSceneTransition)
      this.state.portals!.add(portal)
    })
  }

  // Handler methods for interactions
  private handleSkillInteraction = (skillId: string): void => {
    gameEventBridge.emitGameEvent('game:skill-selected', { skillId })
  }

  private handleSceneTransition = (sceneName: string): void => {
    gameEventBridge.emitGameEvent('game:scene-starting', { sceneName })
    this.scene.start(sceneName)
  }

  private setupControls(): void {
    this.state.cursors = this.input.keyboard!.createCursorKeys()
    
    // Space for interaction
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (this.state.nearestPortal) {
        const portalData = this.state.nearestPortal.getData('portalData')
        if (portalData) {
          this.handleSceneTransition(portalData.targetScene)
        }
      } else if (this.state.nearestNPC) {
        const skillData = this.state.nearestNPC.getData('skillData')
        if (skillData) {
          this.handleSkillInteraction(skillData.id)
        }
      }
    })
  }

  private setupUI(): void {
    // Interaction prompt
    this.state.interactionPrompt = this.add.text(
      this.scale.width / 2, 
      this.scale.height - 80, 
      '', 
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#2c3e50aa',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setVisible(false)

    // Navigation hints
    this.add.text(20, this.scale.height - 60, 'WASD/Arrows: Move | SPACE: Interact', {
      fontSize: '14px',
      color: '#7f8c8d'
    })
  }



  update(): void {
    if (!this.state.player || !this.state.cursors) return

    // Handle player movement using functional approach
    updatePlayerVelocity(this.state.player, this.state.cursors, this.input.keyboard!)

    // Check for portal proximity
    this.updatePortalProximity()

    // Check for NPC proximity
    this.updateNPCProximity()
  }

  private updatePortalProximity(): void {
    if (!this.state.portals || !this.state.player || !this.state.interactionPrompt) return

    const portals = this.state.portals.children.entries as Phaser.GameObjects.GameObject[]
    const nearestPortal = findNearestObject(this.state.player, portals, 100)

    if (nearestPortal !== this.state.nearestPortal) {
      this.state.nearestPortal = nearestPortal
      
      if (this.state.nearestPortal) {
        const portalData = this.state.nearestPortal.getData('portalData')
        this.state.interactionPrompt.setText(`Press SPACE to travel to ${portalData.name}`)
        this.state.interactionPrompt.setVisible(true)
      } else if (!this.state.nearestNPC) {
        this.state.interactionPrompt.setVisible(false)
      }
    }
  }

  private updateNPCProximity(): void {
    if (!this.state.skillNPCs || !this.state.player || !this.state.interactionPrompt || this.state.nearestPortal) return

    const npcs = this.state.skillNPCs.children.entries as Phaser.GameObjects.GameObject[]
    const nearestNPC = findNearestObject(this.state.player, npcs, 80)

    if (nearestNPC !== this.state.nearestNPC) {
      this.state.nearestNPC = nearestNPC
      
      if (this.state.nearestNPC && !this.state.nearestPortal) {
        const skillData = this.state.nearestNPC.getData('skillData')
        this.state.interactionPrompt.setText(`Press SPACE to learn about ${skillData.name}`)
        this.state.interactionPrompt.setVisible(true)
      } else if (!this.state.nearestPortal) {
        this.state.interactionPrompt.setVisible(false)
      }
    }
  }
}