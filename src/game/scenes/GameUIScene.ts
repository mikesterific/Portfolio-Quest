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
  private combatButton!: Phaser.GameObjects.Text
  private combatToggleButton!: Phaser.GameObjects.Text
  private combatEnabled: boolean = false
  private radarMarker?: Phaser.GameObjects.Arc

  constructor() {
    super({ key: 'GameUIScene', active: true })
  }

  create(): void {
    
    // Initialize combat setting from localStorage
    this.initializeCombatSetting()
    
    // Initialize UI overlay
    this.setupUI()
    
    this.setupEventListeners()
    
    // Broadcast initial combat setting before starting scenes
    this.broadcastCombatSetting()
    
    // Start Skills Command Center in parallel so this UI scene stays active
    this.scene.launch('SkillSpaceScene')
    // Ensure UI scene renders above gameplay scene
    try {
      this.scene.moveAbove('GameUIScene', 'SkillSpaceScene')
      this.scene.bringToTop()
    } catch (err) {
      console.warn('Could not adjust scene order:', err)
    }
    this.updateCurrentSceneDisplay('SkillSpaceScene')
    
    // Emit game event for initial scene
    gameEventBridge.emitGameEvent('game:scene-changed', { sceneName: 'SkillSpaceScene' })
  }

  private initializeCombatSetting(): void {
    // Read combat setting from localStorage, default to false for professional presentations
    const stored = localStorage.getItem('portfolioQuest_combatEnabled')
    this.combatEnabled = stored ? JSON.parse(stored) : false
  }

  private broadcastCombatSetting(): void {
    // Emit the initial combat setting so scenes can configure accordingly
    gameEventBridge.emitGameEvent('ui:setting-changed', {
      key: 'combatEnabled',
      value: this.combatEnabled
    })
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

    // Combat Toggle button (top-right, below Skip Game)
    try {
      
      this.combatToggleButton = this.add.text(width - 20, 70, this.getCombatButtonText(), {
        fontSize: '24px', // Even larger
        color: '#ffffff',
        padding: { x: 15, y: 10 },
      })
      .setOrigin(1, 0)
      .setDepth(10000) // Set high depth immediately
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.toggleCombatSetting()
      })
      .on('pointerover', () => {
        this.combatToggleButton.setScale(1)
      })
      .on('pointerout', () => this.combatToggleButton.setScale(1))
      
    } catch (error) {
      console.error('❌ Error creating combat toggle button:', error)
    }

    // Sound toggle button (top-left)
    this.soundButton = this.add.text(20, 20, '🔊 Sound: ON', {
      fontSize: '16px',
      color: '#ffffff',
      padding: { x: 10, y: 5 }
    })
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.toggleSound())
    .on('pointerover', () => this.soundButton.setScale(1.1))
    .on('pointerout', () => this.soundButton.setScale(1))

    // Combat toggle button (top-left, below sound) - DEPRECATED, keeping for compatibility
    this.combatButton = this.add.text(20, 70, '⚔️ Combat: ON', {
      fontSize: '16px',
      color: '#ffffff',
      padding: { x: 10, y: 5 }
    })
    .setVisible(false) // Hide the old combat button
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.toggleCombat())
    .on('pointerover', () => this.combatButton.setScale(1.1))
    .on('pointerout', () => this.combatButton.setScale(1))

    // XP display (top-left, below combat)
    // Removed XP display

    // Current scene indicator (bottom-center)
    this.currentSceneText = this.add.text(width / 2, height - 30, 'Loading...', {
      fontSize: '18px',
      color: '#ecf0f1',
      padding: { x: 15, y: 8 }
    })
    .setOrigin(0.5, 1)

    // Make UI elements stay in fixed positions
    this.skipButton.setScrollFactor(0).setDepth(10000)
    this.combatToggleButton.setScrollFactor(0).setDepth(10000)
    this.soundButton.setScrollFactor(0).setDepth(10000)
    this.combatButton.setScrollFactor(0).setDepth(10000)
    this.currentSceneText.setScrollFactor(0).setDepth(10000)

    // Debug log to verify combat toggle button creation
    console.log('🎮 Combat toggle button created:', {
      x: this.combatToggleButton.x,
      y: this.combatToggleButton.y,
      text: this.combatToggleButton.text,
      visible: this.combatToggleButton.visible,
      active: this.combatToggleButton.active
    })

    // XP display removed
  }

  private getCombatButtonText(): string {
    return this.combatEnabled ? '⚔️ Enemies: ON' : '🛡️ Enemies: OFF'
  }

  private getCombatButtonColor(): string {
    return this.combatEnabled ? '#e74c3c' : '#95a5a6'
  }

  private toggleCombatSetting(): void {
    // Safety check to prevent errors during hot reload
    if (!this.combatToggleButton || !this.combatToggleButton.scene || !this.combatToggleButton.active) {
      console.warn('[GameUIScene] Combat toggle button is not available, skipping toggle')
      return
    }

    try {
      // Toggle the setting
      this.combatEnabled = !this.combatEnabled
      
      // Persist to localStorage
      localStorage.setItem('portfolioQuest_combatEnabled', JSON.stringify(this.combatEnabled))
      
      // Update button appearance
      this.updateCombatToggleButton()
      
      // Broadcast the change
      gameEventBridge.emitGameEvent('ui:setting-changed', {
        key: 'combatEnabled',
        value: this.combatEnabled
      })
    } catch (error) {
      console.warn('[GameUIScene] Error toggling combat setting:', error)
    }
  }

  private updateCombatToggleButton(): void {
    // Safety check to prevent errors during hot reload
    if (!this.combatToggleButton || !this.combatToggleButton.scene || !this.combatToggleButton.active) {
      console.warn('[GameUIScene] Combat toggle button is not available, skipping update')
      return
    }

    try {
      this.combatToggleButton.setText(this.getCombatButtonText())
      this.combatToggleButton.setStyle({ backgroundColor: this.getCombatButtonColor() })
    } catch (error) {
      console.warn('[GameUIScene] Error updating combat toggle button:', error)
    }
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
      } else if (data.key === 'combatEnabled') {
        this.updateCombatButton(data.value)
      }
    })

    // XP change listener removed

    // Show a subtle toast when all stations are unlocked
    gameEventBridge.onGameEvent('game:progress-complete', (data) => {
      try {
        const toast = this.add.text(this.scale.width / 2, 80, `All stations unlocked!`, {
          fontSize: '20px',
          color: '#2ecc71',
          backgroundColor: '#2c3e50aa',
          padding: { x: 14, y: 8 }
        }).setOrigin(0.5)

        this.tweens.add({
          targets: toast,
          y: toast.y - 30,
          alpha: { from: 1, to: 0 },
          duration: 1400,
          ease: 'Power2.easeOut',
          onComplete: () => toast.destroy()
        })
      } catch (error) {
        console.warn('[GameUIScene] Error showing completion toast:', error)
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

  private toggleCombat(): void {
    // Safety check to prevent errors during hot reload
    if (!this.combatButton || !this.combatButton.scene || !this.combatButton.active) {
      console.warn('[GameUIScene] Combat button is not available, skipping toggle')
      return
    }

    try {
      const currentCombatState = this.combatButton.text.includes('ON')
      const newCombatState = !currentCombatState
      
      this.updateCombatButton(newCombatState)
      gameEventBridge.emitGameEvent('ui:setting-changed', { 
        key: 'combatEnabled', 
        value: newCombatState 
      })
    } catch (error) {
      console.warn('[GameUIScene] Error toggling combat:', error)
    }
  }

  private updateCombatButton(combatEnabled: boolean): void {
    // Safety check to prevent errors during hot reload
    if (!this.combatButton || !this.combatButton.scene || !this.combatButton.active) {
      console.warn('[GameUIScene] Combat button is not available, skipping update')
      return
    }

    try {
      this.combatButton.setText(combatEnabled ? '⚔️ Combat: ON' : '🛡️ Combat: OFF')
      this.combatButton.setStyle({ backgroundColor: combatEnabled ? '#e74c3c' : '#95a5a6' })
    } catch (error) {
      console.warn('[GameUIScene] Error updating combat button:', error)
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

  // XP-related methods removed

  update(): void {
    // Handle any continuous UI updates here
  }
}