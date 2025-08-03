import Phaser from 'phaser'
import gameEventBridge from '../GameEventBridge'

/**
 * Project Forest Scene - Interactive area showcasing portfolio projects
 * Treasure chests and interactive objects represent different projects
 */
export class ProjectForestScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private projectChests: Phaser.GameObjects.Group | null = null
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private interactionPrompt!: Phaser.GameObjects.Text
  private nearestChest: Phaser.GameObjects.GameObject | null = null

  constructor() {
    super({ key: 'ProjectForestScene' })
  }

  create(): void {
    console.log('[ProjectForestScene] Creating Project Forest')
    
    this.setupWorld()
    this.createPlayer()
    this.createProjectChests()
    this.setupControls()
    this.setupUI()
  }

  private setupWorld(): void {
    const { width, height } = this.scale

    // Create forest background
    this.add.rectangle(width / 2, height / 2, width, height, 0x27ae60, 0.3)
    
    // Add forest title
    this.add.text(width / 2, 60, '🌲 Project Forest', {
      fontSize: '32px',
      color: '#2c3e50',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(width / 2, 120, 'Discover treasure chests containing my projects!', {
      fontSize: '18px',
      color: '#34495e'
    }).setOrigin(0.5)

    // Add decorative trees
    const trees = ['🌲', '🌳', '🌿', '🍃']
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, width - 50)
      const y = Phaser.Math.Between(180, height - 180)
      const tree = trees[Phaser.Math.Between(0, trees.length - 1)]
      this.add.text(x, y, tree, { fontSize: '30px' })
    }
  }

  private createPlayer(): void {
    const { width, height } = this.scale
    
    this.player = this.add.rectangle(width / 2, height / 2, 32, 32, 0xe74c3c)
    this.physics.add.existing(this.player)
    
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)
    playerBody.setDrag(500)
  }

  private createProjectChests(): void {
    this.projectChests = this.add.group()

    const projects = [
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

    projects.forEach(project => {
      const chest = this.add.container(project.x, project.y)
      
      // Chest visual representation
      const chestBody = this.add.rectangle(0, 0, 60, 50, 0xd4af37, 0.9)
      chestBody.setStrokeStyle(3, 0x8b4513)
      
      const chestEmoji = this.add.text(0, -5, '📦', { 
        fontSize: '32px' 
      }).setOrigin(0.5)
      
      const chestLabel = this.add.text(0, 40, project.title, { 
        fontSize: '12px', 
        color: '#2c3e50',
        align: 'center',
        backgroundColor: '#ffffffaa',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5)

      // Add sparkle effect
      const sparkle = this.add.text(25, -25, '✨', { 
        fontSize: '16px' 
      }).setOrigin(0.5)
      
      // Animate sparkle
      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0.3, to: 1 },
        scale: { from: 0.8, to: 1.2 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000)
      })

      chest.add([chestBody, chestEmoji, chestLabel, sparkle])
      
      // Add physics
      this.physics.add.existing(chest, true)
      
      // Store project data
      chest.setData('projectData', project)
      chest.setData('isChest', true)
      
      // Add interactive behavior
      chest.setInteractive()
      chest.on('pointerdown', () => this.openProject(project.id))
      
      this.projectChests!.add(chest)
    })
  }

  private setupControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys()
    
    // Space for interaction
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (this.nearestChest) {
        const projectData = this.nearestChest.getData('projectData')
        if (projectData) {
          this.openProject(projectData.id)
        }
      }
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
        backgroundColor: '#27ae60aa',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setVisible(false)

    // Navigation hints
    this.add.text(20, this.scale.height - 60, 'WASD/Arrows: Move | SPACE: Open chest', {
      fontSize: '14px',
      color: '#7f8c8d'
    })

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

    // Portal to Resume Tower
    const towerPortal = this.add.container(width - 50, height / 2)
    towerPortal.add([
      this.add.rectangle(0, 0, 60, 80, 0x8e44ad, 0.7),
      this.add.text(0, -10, '🏰', { fontSize: '24px' }).setOrigin(0.5),
      this.add.text(0, 15, 'Résumé\nTower', { fontSize: '10px', align: 'center', color: '#ffffff' }).setOrigin(0.5)
    ])
    towerPortal.setInteractive()
    towerPortal.on('pointerdown', () => this.goToScene('ResumeTowerScene'))
  }

  private openProject(projectId: string): void {
    console.log(`[ProjectForestScene] Opening project: ${projectId}`)
    
    // Add chest opening animation
    if (this.nearestChest) {
      this.tweens.add({
        targets: this.nearestChest,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      })
    }
    
    gameEventBridge.emitGameEvent('game:project-selected', { projectId })
  }

  private goToScene(sceneName: string): void {
    console.log(`[ProjectForestScene] Transitioning to: ${sceneName}`)
    gameEventBridge.emitGameEvent('game:scene-starting', { sceneName })
    this.scene.start(sceneName)
  }

  update(): void {
    this.handlePlayerMovement()
    this.checkChestProximity()
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

  private checkChestProximity(): void {
    if (!this.projectChests) return

    let nearestChest: Phaser.GameObjects.GameObject | null = null
    let nearestDistance = Infinity

    this.projectChests.children.entries.forEach(chest => {
      const chestSprite = chest as Phaser.GameObjects.Sprite
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        chestSprite.x, chestSprite.y
      )

      if (distance < 100 && distance < nearestDistance) {
        nearestDistance = distance
        nearestChest = chestSprite
      }
    })

    if (nearestChest !== this.nearestChest) {
      this.nearestChest = nearestChest
      
      if (this.nearestChest) {
        const chestSprite = this.nearestChest as Phaser.GameObjects.Sprite
        const projectData = chestSprite.getData('projectData')
        this.interactionPrompt.setText(`Press SPACE to explore ${projectData.title}`)
        this.interactionPrompt.setVisible(true)
      } else {
        this.interactionPrompt.setVisible(false)
      }
    }
  }
}