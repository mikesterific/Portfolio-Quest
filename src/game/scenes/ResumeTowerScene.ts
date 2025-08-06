import Phaser from 'phaser'
import gameEventBridge from '../GameEventBridge'
import { createPlayer, updatePlayerVelocity, preloadPlayerAssets, findNearestObject } from '../systems/PlayerSystem'

// Types for scene state
interface SceneState {
  player: Phaser.GameObjects.Sprite | null
  resumeBooks: Phaser.GameObjects.Group | null
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null
  interactionPrompt: Phaser.GameObjects.Text | null
  nearestBook: Phaser.GameObjects.GameObject | null
}

interface ResumeElementData {
  id: string
  title: string
  emoji: string
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
const createResumeElementsData = (): ResumeElementData[] => [
  { 
    id: 'full-resume', 
    title: 'Complete Résumé', 
    emoji: '📄',
    x: 400, 
    y: 300,
    description: 'My complete professional resume with all details'
  },
  { 
    id: 'experience', 
    title: 'Work Experience', 
    emoji: '💼',
    x: 300, 
    y: 400,
    description: 'Professional experience and career highlights'
  },
  { 
    id: 'education', 
    title: 'Education', 
    emoji: '🎓',
    x: 700, 
    y: 400,
    description: 'Educational background and certifications'
  },
  { 
    id: 'achievements', 
    title: 'Achievements', 
    emoji: '🏆',
    x: 500, 
    y: 500,
    description: 'Awards, recognitions, and notable accomplishments'
  },
  { 
    id: 'contact', 
    title: 'Contact Information', 
    emoji: '📧',
    x: 600, 
    y: 250,
    description: 'Get in touch with me for opportunities'
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
    id: 'forest',
    name: 'Project Forest',
    targetScene: 'ProjectForestScene',
    x: width - 50,
    y: height / 2,
    color: 0x27ae60,
    emoji: '🌲'
  }
]

// Factory functions for creating game objects

const createResumeBook = (
  scene: Phaser.Scene, 
  element: ResumeElementData, 
  onInteract: (sectionId: string) => void
): Phaser.GameObjects.Container => {
  const book = scene.add.container(element.x, element.y)
  
  const bookBody = scene.add.rectangle(0, 0, 70, 45, 0x2c3e50, 0.9)
  bookBody.setStrokeStyle(2, 0x34495e)
  
  const bookEmoji = scene.add.text(0, -5, element.emoji, { fontSize: '28px' }).setOrigin(0.5)
  
  const bookLabel = scene.add.text(0, 35, element.title, { 
    fontSize: '11px', 
    color: '#2c3e50',
    align: 'center',
    backgroundColor: '#ecf0f1aa',
    padding: { x: 4, y: 2 }
  }).setOrigin(0.5)

  // Add floating effect
  scene.tweens.add({
    targets: book,
    y: element.y - 5,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
    delay: Phaser.Math.Between(0, 1000)
  })

  book.add([bookBody, bookEmoji, bookLabel])
  scene.physics.add.existing(book, true)
  
  book.setData('resumeData', element)
  book.setData('isBook', true)
  book.setSize(70, 45)
  book.setInteractive()
  book.on('pointerdown', () => onInteract(element.id))
  
  return book
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

  scene.add.rectangle(width / 2, height / 2, width, height, 0x8e44ad, 0.3)
  
  scene.add.text(width / 2, 60, '🏰 Résumé Tower', {
    fontSize: '32px',
    color: '#2c3e50',
    fontStyle: 'bold'
  }).setOrigin(0.5)

  scene.add.text(width / 2, 120, 'Explore my professional journey and achievements!', {
    fontSize: '18px',
    color: '#34495e'
  }).setOrigin(0.5)
}

const createTowerStructure = (scene: Phaser.Scene): void => {
  const { width, height } = scene.scale
  const centerX = width / 2
  const centerY = height / 2

  // Main tower body
  scene.add.rectangle(centerX, centerY + 50, 200, 300, 0x95a5a6, 0.8)
    .setStrokeStyle(4, 0x7f8c8d)

  // Tower top
  scene.add.triangle(centerX, centerY - 100, 0, 60, -60, 0, 60, 0, 0x34495e)

  // Tower windows
  const windowPositions = [
    { x: centerX - 40, y: centerY - 20 },
    { x: centerX + 40, y: centerY - 20 },
    { x: centerX - 40, y: centerY + 40 },
    { x: centerX + 40, y: centerY + 40 }
  ]

  windowPositions.forEach(pos => {
    scene.add.rectangle(pos.x, pos.y, 25, 35, 0xf39c12, 0.9)
      .setStrokeStyle(2, 0xd68910)
  })

  // Tower door
  scene.add.rectangle(centerX, centerY + 130, 40, 60, 0x8b4513, 0.9)
    .setStrokeStyle(3, 0x6b3410)
    
  scene.add.text(centerX, centerY + 130, '🚪', { fontSize: '32px' }).setOrigin(0.5)
}

/**
 * Resume Tower Scene - Interactive area for viewing resume/CV
 * Central tower with books, scrolls, and interactive resume elements
 */
export class ResumeTowerScene extends Phaser.Scene {
  private state: SceneState = {
    player: null,
    resumeBooks: null,
    cursors: null,
    interactionPrompt: null,
    nearestBook: null
  }

  constructor() {
    super({ key: 'ResumeTowerScene' })
  }

  preload(): void {
    preloadPlayerAssets(this)
  }

  create(): void {
    // Creating Resume Tower
    
    // Initialize scene using functional approach
    this.initializeScene()
  }

  private initializeScene(): void {
    const { width, height } = this.scale
    
    // Setup world background and tower structure
    setupWorldBackground(this)
    createTowerStructure(this)
    
    // Create player
    this.state.player = createPlayer(this, width / 2, height - 150)
    
    // Create resume books
    this.state.resumeBooks = this.add.group()
    const resumeElements = createResumeElementsData()
    resumeElements.forEach(element => {
      const book = createResumeBook(this, element, this.handleResumeInteraction)
      this.state.resumeBooks!.add(book)
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
  private handleResumeInteraction = (sectionId: string): void => {
    // Viewing resume section
    
    // Add book opening animation
    if (this.state.nearestBook) {
      this.tweens.add({
        targets: this.state.nearestBook,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        yoyo: true,
        ease: 'Back.easeOut'
      })
    }
    
    if (sectionId === 'contact') {
      gameEventBridge.emitGameEvent('game:contact-opened', undefined)
    } else {
      gameEventBridge.emitGameEvent('game:resume-opened', undefined)
    }
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
      if (this.state.nearestBook) {
        const resumeData = this.state.nearestBook.getData('resumeData')
        if (resumeData) {
          this.handleResumeInteraction(resumeData.id)
        }
      }
    })

    // Enter key to open full resume
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.handleResumeInteraction('full-resume')
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
        backgroundColor: '#8e44adaa',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setVisible(false)

    // Navigation hints
    this.add.text(20, this.scale.height - 60, 'WASD/Arrows: Move | SPACE: Read | ENTER: Full Resume', {
      fontSize: '14px',
      color: '#7f8c8d'
    })

    // Quick resume button
    this.add.text(this.scale.width / 2, this.scale.height - 130, 'Press ENTER for Complete Résumé', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#e74c3c',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5)
  }

  update(): void {
    if (!this.state.player || !this.state.cursors) return

    // Handle player movement using functional approach
    updatePlayerVelocity(this.state.player, this.state.cursors, this.input.keyboard!)

    // Check for book proximity
    this.updateBookProximity()
  }

  private updateBookProximity(): void {
    if (!this.state.resumeBooks || !this.state.player || !this.state.interactionPrompt) return

    const books = this.state.resumeBooks.children.entries as Phaser.GameObjects.GameObject[]
    const nearestBook = findNearestObject(this.state.player, books, 90)

    if (nearestBook !== this.state.nearestBook) {
      this.state.nearestBook = nearestBook
      
      if (this.state.nearestBook) {
        const resumeData = this.state.nearestBook.getData('resumeData')
        this.state.interactionPrompt.setText(`Press SPACE to view ${resumeData.title}`)
        this.state.interactionPrompt.setVisible(true)
      } else {
        this.state.interactionPrompt.setVisible(false)
      }
    }
  }
}