import Phaser from 'phaser'
import gameEventBridge from '../GameEventBridge'
import { createPlayer, updatePlayerVelocity, preloadPlayerAssets, findNearestObject } from '../systems/PlayerSystem'

// Types for scene state
interface SceneState {
  player: Phaser.GameObjects.Sprite | null
  projectChests: Phaser.GameObjects.Group | null
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null
  interactionPrompt: Phaser.GameObjects.Text | null
  nearestChest: Phaser.GameObjects.GameObject | null
}

interface ProjectData {
  id: string
  title: string
  type: 'game' | 'web' | 'mobile' | 'library'
  x: number
  y: number
  description: string
}

interface PortalData {
  id: string
  name: string
  targetScene: string
  x: number
  y: number
  color: number
  emoji: string
}

// Pure functions for scene logic
const createProjectsData = (): ProjectData[] => [
  { 
    id: 'portfolio-quest', 
    title: 'Portfolio Quest', 
    type: 'game',
    x: 250, 
    y: 300,
    description: 'Interactive portfolio game built with Vue 3 and Phaser.js'
  },
  { 
    id: 'ecommerce-app', 
    title: 'E-commerce Platform', 
    type: 'web',
    x: 500, 
    y: 250,
    description: 'Full-stack e-commerce solution with React and Node.js'
  },
  { 
    id: 'mobile-fitness', 
    title: 'Fitness Tracker', 
    type: 'mobile',
    x: 750, 
    y: 300,
    description: 'React Native app for fitness tracking and social features'
  },
  { 
    id: 'data-viz', 
    title: 'Data Visualization Tool', 
    type: 'web',
    x: 400, 
    y: 450,
    description: 'Interactive dashboards built with D3.js and Vue'
  },
  { 
    id: 'component-library', 
    title: 'Component Library', 
    type: 'library',
    x: 650, 
    y: 500,
    description: 'Reusable Vue 3 component library with Storybook'
  }
]

const createPortalsData = (width: number, height: number): PortalData[] => [
  {
    id: 'village',
    name: 'Skills Command Center',
    targetScene: 'SkillSpaceScene',
    x: 50,
    y: height / 2,
    color: 0x3498db,
    emoji: '🚀'
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

const generateRandomTrees = (width: number, height: number, count: number = 15): Array<{ x: number; y: number; emoji: string }> => {
  const trees = ['🌲', '🌳', '🌿', '🍃']
  const treePositions = []
  
  for (let i = 0; i < count; i++) {
    treePositions.push({
      x: Phaser.Math.Between(50, width - 50),
      y: Phaser.Math.Between(180, height - 180),
      emoji: trees[Phaser.Math.Between(0, trees.length - 1)]
    })
  }
  
  return treePositions
}

// Factory functions for creating game objects

const createProjectChest = (
  scene: Phaser.Scene, 
  project: ProjectData, 
  onInteract: (projectId: string) => void
): Phaser.GameObjects.Container => {
  const chest = scene.add.container(project.x, project.y)
  
  const chestBody = scene.add.rectangle(0, 0, 60, 50, 0xd4af37, 0.9)
  chestBody.setStrokeStyle(3, 0x8b4513)
  
  const chestEmoji = scene.add.text(0, -5, '📦', { fontSize: '32px' }).setOrigin(0.5)
  
  const chestLabel = scene.add.text(0, 40, project.title, { 
    fontSize: '12px', 
    color: '#2c3e50',
    align: 'center',
    backgroundColor: '#ffffffaa',
    padding: { x: 4, y: 2 }
  }).setOrigin(0.5)

  // Add sparkle effect
  const sparkle = scene.add.text(25, -25, '✨', { fontSize: '16px' }).setOrigin(0.5)
  
  // Animate sparkle
  scene.tweens.add({
    targets: sparkle,
    alpha: { from: 0.3, to: 1 },
    scale: { from: 0.8, to: 1.2 },
    duration: 1500,
    yoyo: true,
    repeat: -1,
    delay: Phaser.Math.Between(0, 1000)
  })

  chest.add([chestBody, chestEmoji, chestLabel, sparkle])
  scene.physics.add.existing(chest, true)
  
  chest.setData('projectData', project)
  chest.setData('isChest', true)
  chest.setSize(60, 50)
  chest.setInteractive()
  chest.on('pointerdown', () => onInteract(project.id))
  
  return chest
}

const createPortal = (
  scene: Phaser.Scene, 
  portalData: PortalData,
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
  
  portal.setSize(60, 80)
  portal.setInteractive()
  portal.on('pointerdown', () => onActivate(portalData.targetScene))
  
  return portal
}

const setupWorldBackground = (scene: Phaser.Scene): void => {
  const { width, height } = scene.scale

  scene.add.rectangle(width / 2, height / 2, width, height, 0x27ae60, 0.3)
  
  scene.add.text(width / 2, 60, '🌲 Project Forest', {
    fontSize: '32px',
    color: '#2c3e50',
    fontStyle: 'bold'
  }).setOrigin(0.5)

  scene.add.text(width / 2, 120, 'Discover treasure chests containing my projects!', {
    fontSize: '18px',
    color: '#34495e'
  }).setOrigin(0.5)

  // Add decorative trees
  const trees = generateRandomTrees(width, height)
  trees.forEach(tree => {
    scene.add.text(tree.x, tree.y, tree.emoji, { fontSize: '30px' })
  })
}

/**
 * Project Forest Scene - Interactive area showcasing portfolio projects
 * Treasure chests and interactive objects represent different projects
 */
export class ProjectForestScene extends Phaser.Scene {
  private state: SceneState = {
    player: null,
    projectChests: null,
    cursors: null,
    interactionPrompt: null,
    nearestChest: null
  }

  constructor() {
    super({ key: 'ProjectForestScene' })
  }

  preload(): void {
    preloadPlayerAssets(this)
  }

  create(): void {
    // Creating Project Forest
    
    // Initialize scene using functional approach
    this.initializeScene()
  }

  private initializeScene(): void {
    const { width, height } = this.scale
    
    // Setup world background
    setupWorldBackground(this)
    
    // Create player
    this.state.player = createPlayer(this, width / 2, height / 2)
    
    // Create project chests
    this.state.projectChests = this.add.group()
    const projects = createProjectsData()
    projects.forEach(project => {
      const chest = createProjectChest(this, project, this.handleProjectInteraction)
      this.state.projectChests!.add(chest)
    })
    
    // Setup controls
    this.setupControls()
    
    // Create UI elements
    this.setupUI()
    
    // Create portals
    const portalsData = createPortalsData(width, height)
    portalsData.forEach(portalData => {
      createPortal(this, portalData, this.handleSceneTransition)
    })
  }

  // Handler methods for interactions
  private handleProjectInteraction = (projectId: string): void => {
    // Opening project
    
    // Add chest opening animation
    if (this.state.nearestChest) {
      this.tweens.add({
        targets: this.state.nearestChest,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      })
    }
    
    gameEventBridge.emitGameEvent('game:project-selected', { projectId })
  }

  private handleSceneTransition = (sceneName: string): void => {
    // Transitioning to scene
    gameEventBridge.emitGameEvent('game:scene-starting', { sceneName })
    this.scene.start(sceneName)
  }

  private setupControls(): void {
    this.state.cursors = this.input.keyboard!.createCursorKeys()
    
    // Space for interaction
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (this.state.nearestChest) {
        const projectData = this.state.nearestChest.getData('projectData')
        if (projectData) {
          this.handleProjectInteraction(projectData.id)
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
        backgroundColor: '#27ae60aa',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setVisible(false)

    // Navigation hints
    this.add.text(20, this.scale.height - 60, 'WASD/Arrows: Move | SPACE: Open chest', {
      fontSize: '14px',
      color: '#7f8c8d'
    })
  }

  update(): void {
    if (!this.state.player || !this.state.cursors) return

    // Handle player movement using functional approach
    updatePlayerVelocity(this.state.player, this.state.cursors, this.input.keyboard!)

    // Check for chest proximity
    this.updateChestProximity()
  }

  private updateChestProximity(): void {
    if (!this.state.projectChests || !this.state.player || !this.state.interactionPrompt) return

    const chests = this.state.projectChests.children.entries as Phaser.GameObjects.GameObject[]
    const nearestChest = findNearestObject(this.state.player, chests, 100)

    if (nearestChest !== this.state.nearestChest) {
      this.state.nearestChest = nearestChest
      
      if (this.state.nearestChest) {
        const projectData = this.state.nearestChest.getData('projectData')
        this.state.interactionPrompt.setText(`Press SPACE to explore ${projectData.title}`)
        this.state.interactionPrompt.setVisible(true)
      } else {
        this.state.interactionPrompt.setVisible(false)
      }
    }
  }
}