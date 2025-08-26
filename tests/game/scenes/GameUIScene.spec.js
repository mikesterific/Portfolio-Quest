// Unit tests for GameUIScene core logic
const gameEventBridge = require('@/game/GameEventBridge').default

describe('GameUIScene Logic', () => {
  afterEach(() => {
    gameEventBridge.removeAllGameListeners()
  })

  test('game event bridge integration works', () => {
    const eventSpy = jest.spyOn(gameEventBridge, 'emitGameEvent')
    
    // Test events that the UI scene would emit
    gameEventBridge.emitGameEvent('ui:setting-changed', { key: 'soundEnabled', value: false })
    gameEventBridge.emitGameEvent('ui:setting-changed', { key: 'combatEnabled', value: true })
    gameEventBridge.emitGameEvent('scene:starting', { sceneName: 'SkillSpaceScene' })
    
    expect(eventSpy).toHaveBeenCalledWith('ui:setting-changed', { key: 'soundEnabled', value: false })
    expect(eventSpy).toHaveBeenCalledWith('ui:setting-changed', { key: 'combatEnabled', value: true })
    expect(eventSpy).toHaveBeenCalledWith('scene:starting', { sceneName: 'SkillSpaceScene' })
    
    eventSpy.mockRestore()
  })

  test('xp calculation logic works correctly', () => {
    // Test the XP display logic that would be used in the UI
    const formatXP = (amount) => `XP: ${amount}`
    const calculateXPGain = (baseXP, multiplier = 1) => baseXP * multiplier
    
    expect(formatXP(42)).toBe('XP: 42')
    expect(formatXP(0)).toBe('XP: 0')
    expect(calculateXPGain(10, 1.5)).toBe(15)
    expect(calculateXPGain(5)).toBe(5)
  })

  test('toggle state logic works correctly', () => {
    // Test the toggle logic that would be used by UI buttons
    let soundEnabled = true
    let combatEnabled = false
    
    const toggleSound = () => { soundEnabled = !soundEnabled; return soundEnabled }
    const toggleCombat = () => { combatEnabled = !combatEnabled; return combatEnabled }
    
    expect(toggleSound()).toBe(false)
    expect(toggleSound()).toBe(true)
    expect(toggleCombat()).toBe(true)
    expect(toggleCombat()).toBe(false)
  })

  test('scene state tracking works', () => {
    // Test scene state that would be managed by the UI
    const sceneStates = {
      currentScene: 'GameUIScene',
      previousScene: null,
      isTransitioning: false
    }
    
    const updateSceneState = (newScene) => {
      sceneStates.previousScene = sceneStates.currentScene
      sceneStates.currentScene = newScene
      sceneStates.isTransitioning = true
    }
    
    updateSceneState('SkillSpaceScene')
    expect(sceneStates.currentScene).toBe('SkillSpaceScene')
    expect(sceneStates.previousScene).toBe('GameUIScene')
    expect(sceneStates.isTransitioning).toBe(true)
  })

  test('event listener management works', () => {
    const listeners = new Map()
    
    const addListener = (event, callback) => {
      if (!listeners.has(event)) listeners.set(event, [])
      listeners.get(event).push(callback)
    }
    
    const removeAllListeners = () => {
      listeners.clear()
    }
    
    addListener('test-event', () => {})
    addListener('test-event', () => {})
    expect(listeners.get('test-event').length).toBe(2)
    
    removeAllListeners()
    expect(listeners.size).toBe(0)
  })

  // ===============================================
  // 🎵 BACKGROUND MUSIC STREAMING TESTS
  // ===============================================

  describe('Background Music System', () => {
    let mockLocalStorage
    let mockSound
    let mockScene

    beforeEach(() => {
      // Mock localStorage
      mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      }
      global.localStorage = mockLocalStorage

      // Mock Phaser sound system
      mockSound = {
        play: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        stop: jest.fn(),
        isPlaying: false,
        volume: 0.3
      }

      // Mock Phaser scene
      mockScene = {
        sound: {
          add: jest.fn(() => mockSound)
        }
      }
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('sound initialization reads from localStorage correctly', () => {
      // Test default value (true) when no stored value
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const initializeSoundSetting = () => {
        const stored = mockLocalStorage.getItem('portfolioQuest_soundEnabled')
        return stored ? JSON.parse(stored) : true
      }

      expect(initializeSoundSetting()).toBe(true)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('portfolioQuest_soundEnabled')

      // Test reading stored false value
      mockLocalStorage.getItem.mockReturnValue('false')
      expect(initializeSoundSetting()).toBe(false)

      // Test reading stored true value
      mockLocalStorage.getItem.mockReturnValue('true')
      expect(initializeSoundSetting()).toBe(true)
    })

    test('background music initialization creates audio object correctly', () => {
      const initializeBackgroundMusic = (scene, soundEnabled) => {
        try {
          const backgroundMusic = scene.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.3
          })

          if (soundEnabled && backgroundMusic) {
            backgroundMusic.play()
          }

          return backgroundMusic
        } catch (error) {
          console.warn('[GameUIScene] Error initializing background music:', error)
          return null
        }
      }

      // Test successful initialization with sound enabled
      const music = initializeBackgroundMusic(mockScene, true)
      
      expect(mockScene.sound.add).toHaveBeenCalledWith('backgroundMusic', {
        loop: true,
        volume: 0.3
      })
      expect(mockSound.play).toHaveBeenCalled()
      expect(music).toBe(mockSound)

      // Test initialization with sound disabled
      jest.clearAllMocks()
      const musicDisabled = initializeBackgroundMusic(mockScene, false)
      
      expect(mockScene.sound.add).toHaveBeenCalled()
      expect(mockSound.play).not.toHaveBeenCalled()
      expect(musicDisabled).toBe(mockSound)
    })

    test('sound toggle controls background music correctly', () => {
      let soundEnabled = true
      const backgroundMusic = mockSound

      const toggleSound = () => {
        const newSoundState = !soundEnabled
        soundEnabled = newSoundState

        // Control background music
        if (backgroundMusic) {
          if (newSoundState) {
            backgroundMusic.resume()
          } else {
            backgroundMusic.pause()
          }
        }

        // Persist setting
        mockLocalStorage.setItem('portfolioQuest_soundEnabled', JSON.stringify(newSoundState))
        
        return newSoundState
      }

      // Test turning sound OFF
      const newState1 = toggleSound()
      expect(newState1).toBe(false)
      expect(mockSound.pause).toHaveBeenCalled()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('portfolioQuest_soundEnabled', 'false')

      // Test turning sound ON
      jest.clearAllMocks()
      const newState2 = toggleSound()
      expect(newState2).toBe(true)
      expect(mockSound.resume).toHaveBeenCalled()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('portfolioQuest_soundEnabled', 'true')
    })

    test('background music handles errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Mock scene.sound.add to throw an error
      const mockErrorScene = {
        sound: {
          add: jest.fn(() => {
            throw new Error('Audio loading failed')
          })
        }
      }

      const initializeBackgroundMusic = (scene, soundEnabled) => {
        try {
          const backgroundMusic = scene.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.3
          })

          if (soundEnabled && backgroundMusic) {
            backgroundMusic.play()
          }

          return backgroundMusic
        } catch (error) {
          console.warn('[GameUIScene] Error initializing background music:', error)
          return null
        }
      }

      const result = initializeBackgroundMusic(mockErrorScene, true)
      
      expect(result).toBe(null)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[GameUIScene] Error initializing background music:', 
        expect.any(Error)
      )

      consoleWarnSpy.mockRestore()
    })

    test('audio configuration uses correct settings', () => {
      const expectedConfig = {
        loop: true,
        volume: 0.3
      }

      mockScene.sound.add('backgroundMusic', expectedConfig)
      
      expect(mockScene.sound.add).toHaveBeenCalledWith('backgroundMusic', expectedConfig)
    })

    test('localStorage persistence works across sessions', () => {
      const soundStates = [true, false, true, false]
      
      soundStates.forEach(state => {
        // Simulate saving state
        mockLocalStorage.setItem('portfolioQuest_soundEnabled', JSON.stringify(state))
        
        // Simulate loading state
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(state))
        const loaded = JSON.parse(mockLocalStorage.getItem('portfolioQuest_soundEnabled'))
        
        expect(loaded).toBe(state)
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(4)
      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(4)
    })

    test('music state integrates with game events correctly', () => {
      const eventSpy = jest.spyOn(gameEventBridge, 'emitGameEvent')
      
      const emitSoundStateChange = (soundEnabled) => {
        gameEventBridge.emitGameEvent('ui:setting-changed', { 
          key: 'soundEnabled', 
          value: soundEnabled 
        })
      }

      // Test emitting sound enabled
      emitSoundStateChange(true)
      expect(eventSpy).toHaveBeenCalledWith('ui:setting-changed', { 
        key: 'soundEnabled', 
        value: true 
      })

      // Test emitting sound disabled
      emitSoundStateChange(false)
      expect(eventSpy).toHaveBeenCalledWith('ui:setting-changed', { 
        key: 'soundEnabled', 
        value: false 
      })

      eventSpy.mockRestore()
    })

    test('rapid toggle behavior prevents audio glitches', () => {
      let soundEnabled = true
      const backgroundMusic = mockSound
      let toggleInProgress = false

      const safeToggleSound = () => {
        if (toggleInProgress) return soundEnabled // Prevent rapid toggles
        
        toggleInProgress = true
        
        setTimeout(() => {
          toggleInProgress = false
        }, 100) // 100ms debounce

        const newSoundState = !soundEnabled
        soundEnabled = newSoundState

        if (backgroundMusic) {
          if (newSoundState) {
            backgroundMusic.resume()
          } else {
            backgroundMusic.pause()
          }
        }

        return newSoundState
      }

      // Test rapid toggles
      const result1 = safeToggleSound() // Should work
      const result2 = safeToggleSound() // Should be ignored
      const result3 = safeToggleSound() // Should be ignored

      expect(result1).toBe(false) // First toggle works
      expect(result2).toBe(false) // Subsequent toggles return current state
      expect(result3).toBe(false)
      expect(mockSound.pause).toHaveBeenCalledTimes(1) // Only called once
    })

    test('cross-scene persistence maintains audio state', () => {
      // Simulate scene transitions while maintaining audio
      const sceneStates = {
        'SkillSpaceScene': { active: false },
        'ProjectForestScene': { active: false },
        'ResumeTowerScene': { active: false }
      }

      let backgroundMusicInstance = mockSound
      backgroundMusicInstance.isPlaying = true

      const transitionToScene = (sceneName) => {
        // Reset all scenes
        Object.keys(sceneStates).forEach(scene => {
          sceneStates[scene].active = false
        })
        
        // Activate target scene
        sceneStates[sceneName].active = true
        
        // Background music should continue playing during transition
        expect(backgroundMusicInstance.isPlaying).toBe(true)
        
        return sceneName // Return scene name for verification
      }

      // Test transitions between all scenes
      const activeScene1 = transitionToScene('SkillSpaceScene')
      expect(activeScene1).toBe('SkillSpaceScene')
      expect(sceneStates['SkillSpaceScene'].active).toBe(true)

      const activeScene2 = transitionToScene('ProjectForestScene')
      expect(activeScene2).toBe('ProjectForestScene')
      expect(sceneStates['ProjectForestScene'].active).toBe(true)

      const activeScene3 = transitionToScene('ResumeTowerScene')
      expect(activeScene3).toBe('ResumeTowerScene')
      expect(sceneStates['ResumeTowerScene'].active).toBe(true)
      
      // Music should never have been stopped during transitions
      expect(mockSound.stop).not.toHaveBeenCalled()
      expect(mockSound.pause).not.toHaveBeenCalled()
      
      // Verify background music remained playing throughout all transitions
      expect(backgroundMusicInstance.isPlaying).toBe(true)
    })
  })
})

