import Phaser from 'phaser'
import gameEventBridge from '../GameEventBridge'

/**
 * UI overlay scene that runs parallel to all game scenes
 * Handles game-side UI elements and communication with Vue components
 */
export class GameUIScene extends Phaser.Scene {
  private soundButton!: Phaser.GameObjects.Text
  private skipButton!: Phaser.GameObjects.Text
  private currentSceneText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'GameUIScene', active: true })
  }

  create(): void {
    // Initialize UI overlay
    
    this.setupUI()
    this.setupEventListeners()
    
    // Start with the Skills Command Center
    this.scene.start('SkillSpaceScene')
    this.updateCurrentSceneDisplay('SkillSpaceScene')
    
    // Emit game event for initial scene
    gameEventBridge.emitGameEvent('game:scene-changed', { sceneName: 'SkillSpaceScene' })
  }

  private setupUI(): void {
    const { width, height } = this.scale

    // Skip Game button (top-right)
    this.skipButton = this.add.text(width - 20, 20, 'Skip Game', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#34495e',
      padding: { x: 10, y: 5 }
    })
    .setOrigin(1, 0)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      gameEventBridge.emitGameEvent('ui:modal-opened', { type: 'traditional-portfolio' })
    })
    .on('pointerover', () => this.skipButton.setScale(1.1))
    .on('pointerout', () => this.skipButton.setScale(1))

    // Sound toggle button (top-left)
    this.soundButton = this.add.text(20, 20, '🔊 Sound: ON', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#34495e',
      padding: { x: 10, y: 5 }
    })
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.toggleSound())
    .on('pointerover', () => this.soundButton.setScale(1.1))
    .on('pointerout', () => this.soundButton.setScale(1))

    // Current scene indicator (bottom-center)
    this.currentSceneText = this.add.text(width / 2, height - 30, 'Loading...', {
      fontSize: '18px',
      color: '#ecf0f1',
      backgroundColor: '#2c3e50aa',
      padding: { x: 15, y: 8 }
    })
    .setOrigin(0.5, 1)

    // Make UI elements stay in fixed positions
    this.skipButton.setScrollFactor(0)
    this.soundButton.setScrollFactor(0)
    this.currentSceneText.setScrollFactor(0)
  }

  private setupEventListeners(): void {
    // Listen for scene changes through game events instead of scene manager
    // This will be triggered by other scenes when they start
    gameEventBridge.onGameEvent('game:scene-starting', (data) => {
      this.updateCurrentSceneDisplay(data.sceneName)
      gameEventBridge.emitGameEvent('game:scene-changed', { sceneName: data.sceneName })
    })

    // Listen for Vue events
    gameEventBridge.onGameEvent('ui:modal-opened', (data) => {
      // Modal opened
      // Could pause game or adjust UI when modals are open
    })

    gameEventBridge.onGameEvent('ui:modal-closed', () => {
      // Modal closed
      // Resume game interactions
    })

    gameEventBridge.onGameEvent('ui:setting-changed', (data) => {
      if (data.key === 'soundEnabled') {
        this.updateSoundButton(data.value)
      }
    })
  }

  private toggleSound(): void {
    // Safety check to prevent errors during hot reload
    if (!this.soundButton || !this.soundButton.scene || !this.soundButton.active) {
      console.warn('[GameUIScene] Sound button is not available, skipping toggle')
      return
    }

    try {
      const currentSoundState = this.soundButton.text.includes('ON')
      const newSoundState = !currentSoundState
      
      this.updateSoundButton(newSoundState)
      gameEventBridge.emitGameEvent('ui:setting-changed', { 
        key: 'soundEnabled', 
        value: newSoundState 
      })
    } catch (error) {
      console.warn('[GameUIScene] Error toggling sound:', error)
    }
  }

  private updateSoundButton(soundEnabled: boolean): void {
    // Safety check to prevent errors during hot reload
    if (!this.soundButton || !this.soundButton.scene || !this.soundButton.active) {
      console.warn('[GameUIScene] Sound button is not available, skipping update')
      return
    }

    try {
      this.soundButton.setText(soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF')
    } catch (error) {
      console.warn('[GameUIScene] Error updating sound button:', error)
    }
  }

  private updateCurrentSceneDisplay(sceneName: string): void {
    // Safety check to prevent errors during hot reload
    if (!this.currentSceneText || !this.currentSceneText.scene || !this.currentSceneText.active) {
      console.warn('[GameUIScene] Scene text object is not available, skipping update')
      return
    }

    const sceneDisplayNames: Record<string, string> = {
      'SkillSpaceScene': '🚀 Skills Command Center',
      'ProjectForestScene': '🌲 Project Forest',
      'ResumeTowerScene': '🏰 Résumé Tower'
    }

    const displayName = sceneDisplayNames[sceneName] || sceneName
    
    try {
      this.currentSceneText.setText(displayName)
      // Updated scene display
    } catch (error) {
      console.warn('[GameUIScene] Error updating scene text:', error)
    }
  }

  update(): void {
    // Handle any continuous UI updates here
  }
}