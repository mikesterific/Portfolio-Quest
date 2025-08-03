import Phaser from 'phaser'
import gameEventBridge from '../GameEventBridge'

/**
 * Resume Tower Scene - Interactive area for viewing resume/CV
 * Central tower with books, scrolls, and interactive resume elements
 */
export class ResumeTowerScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private resumeBooks: Phaser.GameObjects.Group | null = null
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private interactionPrompt!: Phaser.GameObjects.Text
  private nearestBook: Phaser.GameObjects.GameObject | null = null

  constructor() {
    super({ key: 'ResumeTowerScene' })
  }

  create(): void {
    console.log('[ResumeTowerScene] Creating Resume Tower')
    
    this.setupWorld()
    this.createPlayer()
    this.createResumeElements()
    this.setupControls()
    this.setupUI()
  }

  private setupWorld(): void {
    const { width, height } = this.scale

    // Create tower background
    this.add.rectangle(width / 2, height / 2, width, height, 0x8e44ad, 0.3)
    
    // Add tower title
    this.add.text(width / 2, 60, '🏰 Résumé Tower', {
      fontSize: '32px',
      color: '#2c3e50',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(width / 2, 120, 'Explore my professional journey and achievements!', {
      fontSize: '18px',
      color: '#34495e'
    }).setOrigin(0.5)

    // Create tower structure
    this.createTowerStructure()
  }

  private createTowerStructure(): void {
    const { width, height } = this.scale
    const centerX = width / 2
    const centerY = height / 2

    // Main tower body
    this.add.rectangle(centerX, centerY + 50, 200, 300, 0x95a5a6, 0.8)
      .setStrokeStyle(4, 0x7f8c8d)

    // Tower top
    this.add.triangle(centerX, centerY - 100, 0, 60, -60, 0, 60, 0, 0x34495e)

    // Tower windows
    const windowPositions = [
      { x: centerX - 40, y: centerY - 20 },
      { x: centerX + 40, y: centerY - 20 },
      { x: centerX - 40, y: centerY + 40 },
      { x: centerX + 40, y: centerY + 40 }
    ]

    windowPositions.forEach(pos => {
      this.add.rectangle(pos.x, pos.y, 25, 35, 0xf39c12, 0.9)
        .setStrokeStyle(2, 0xd68910)
    })

    // Tower door
    this.add.rectangle(centerX, centerY + 130, 40, 60, 0x8b4513, 0.9)
      .setStrokeStyle(3, 0x6b3410)
      
    this.add.text(centerX, centerY + 130, '🚪', { fontSize: '32px' }).setOrigin(0.5)
  }

  private createPlayer(): void {
    const { width, height } = this.scale
    
    this.player = this.add.rectangle(width / 2, height - 150, 32, 32, 0xe74c3c)
    this.physics.add.existing(this.player)
    
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)
    playerBody.setDrag(500)
  }

  private createResumeElements(): void {
    this.resumeBooks = this.add.group()

    const resumeElements = [
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

    resumeElements.forEach(element => {
      const book = this.add.container(element.x, element.y)
      
      // Book visual representation
      const bookBody = this.add.rectangle(0, 0, 70, 45, 0x2c3e50, 0.9)
      bookBody.setStrokeStyle(2, 0x34495e)
      
      const bookEmoji = this.add.text(0, -5, element.emoji, { 
        fontSize: '28px' 
      }).setOrigin(0.5)
      
      const bookLabel = this.add.text(0, 35, element.title, { 
        fontSize: '11px', 
        color: '#2c3e50',
        align: 'center',
        backgroundColor: '#ecf0f1aa',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5)

      // Add floating effect
      this.tweens.add({
        targets: book,
        y: element.y - 5,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1000)
      })

      book.add([bookBody, bookEmoji, bookLabel])
      
      // Add physics
      this.physics.add.existing(book, true)
      
      // Store resume data
      book.setData('resumeData', element)
      book.setData('isBook', true)
      
      // Add interactive behavior
      book.setInteractive()
      book.on('pointerdown', () => this.viewResumeSection(element.id))
      
      this.resumeBooks!.add(book)
    })
  }

  private setupControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys()
    
    // Space for interaction
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (this.nearestBook) {
        const resumeData = this.nearestBook.getData('resumeData')
        if (resumeData) {
          this.viewResumeSection(resumeData.id)
        }
      }
    })

    // Enter key to open full resume
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.viewResumeSection('full-resume')
    })
  }

  private setupUI(): void {
    // Interaction prompt
    this.interactionPrompt = this.add.text(
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

    // Portals to other areas
    this.createPortals()
  }

  private createPortals(): void {
    const { width, height } = this.scale

    // Portal back to Skill Village
    const villagePortal = this.add.container(50, height / 2)
    villagePortal.add([
      this.add.rectangle(0, 0, 60, 80, 0x3498db, 0.7),
      this.add.text(0, -10, '🏘️', { fontSize: '24px' }).setOrigin(0.5),
      this.add.text(0, 15, 'Skill\nVillage', { fontSize: '10px', align: 'center', color: '#ffffff' }).setOrigin(0.5)
    ])
    villagePortal.setInteractive()
    villagePortal.on('pointerdown', () => this.goToScene('SkillVillageScene'))

    // Portal to Project Forest
    const forestPortal = this.add.container(width - 50, height / 2)
    forestPortal.add([
      this.add.rectangle(0, 0, 60, 80, 0x27ae60, 0.7),
      this.add.text(0, -10, '🌲', { fontSize: '24px' }).setOrigin(0.5),
      this.add.text(0, 15, 'Project\nForest', { fontSize: '10px', align: 'center', color: '#ffffff' }).setOrigin(0.5)
    ])
    forestPortal.setInteractive()
    forestPortal.on('pointerdown', () => this.goToScene('ProjectForestScene'))
  }

  private viewResumeSection(sectionId: string): void {
    console.log(`[ResumeTowerScene] Viewing resume section: ${sectionId}`)
    
    // Add book opening animation
    if (this.nearestBook) {
      this.tweens.add({
        targets: this.nearestBook,
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

  private goToScene(sceneName: string): void {
    console.log(`[ResumeTowerScene] Transitioning to: ${sceneName}`)
    gameEventBridge.emitGameEvent('game:scene-starting', { sceneName })
    this.scene.start(sceneName)
  }

  update(): void {
    this.handlePlayerMovement()
    this.checkBookProximity()
  }

  private handlePlayerMovement(): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const speed = 200

    playerBody.setVelocity(0)

    if (this.cursors.left.isDown || this.input.keyboard!.addKey('A').isDown) {
      playerBody.setVelocityX(-speed)
    } else if (this.cursors.right.isDown || this.input.keyboard!.addKey('D').isDown) {
      playerBody.setVelocityX(speed)
    }

    if (this.cursors.up.isDown || this.input.keyboard!.addKey('W').isDown) {
      playerBody.setVelocityY(-speed)
    } else if (this.cursors.down.isDown || this.input.keyboard!.addKey('S').isDown) {
      playerBody.setVelocityY(speed)
    }
  }

  private checkBookProximity(): void {
    if (!this.resumeBooks) return

    let nearestBook: Phaser.GameObjects.GameObject | null = null
    let nearestDistance = Infinity

    this.resumeBooks.children.entries.forEach(book => {
      const bookSprite = book as Phaser.GameObjects.Sprite
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        bookSprite.x, bookSprite.y
      )

      if (distance < 90 && distance < nearestDistance) {
        nearestDistance = distance
        nearestBook = bookSprite
      }
    })

    if (nearestBook !== this.nearestBook) {
      this.nearestBook = nearestBook
      
      if (this.nearestBook) {
        const bookSprite = this.nearestBook as Phaser.GameObjects.Sprite
        const resumeData = bookSprite.getData('resumeData')
        this.interactionPrompt.setText(`Press SPACE to view ${resumeData.title}`)
        this.interactionPrompt.setVisible(true)
      } else {
        this.interactionPrompt.setVisible(false)
      }
    }
  }
}