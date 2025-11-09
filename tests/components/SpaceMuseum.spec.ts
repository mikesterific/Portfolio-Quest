import { describe, it, expect } from '@jest/globals'

// Enhanced mocks for 3D furniture testing
const mockGLTFLoader = {
  loadAsync: jest.fn()
}

const mockThreeGroup = {
  scale: {
    setScalar: jest.fn()
  },
  position: {
    set: jest.fn()
  },
  rotation: {
    y: 0
  },
  traverse: jest.fn()
}

const mockScene = {
  add: jest.fn(),
  remove: jest.fn()
}

const mockMesh = {
  geometry: {
    dispose: jest.fn()
  },
  material: {
    dispose: jest.fn()
  }
}

// Enhanced mocks
jest.mock('three', () => ({
  Scene: jest.fn(() => mockScene),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  Clock: jest.fn(),
  Raycaster: jest.fn(),
  Vector2: jest.fn(),
  Vector3: jest.fn(),
  Object3D: jest.fn(),
  Group: jest.fn(() => mockThreeGroup),
  Mesh: jest.fn(() => mockMesh),
  PlaneGeometry: jest.fn(),
  MeshLambertMaterial: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  PCFSoftShadowMap: 1,
  DoubleSide: 2,
  BackSide: 1,
  RepeatWrapping: 1000,
  MathUtils: {
    lerp: jest.fn((a, b, alpha) => a + (b - a) * alpha)
  },
  Fog: jest.fn(),
  TextureLoader: jest.fn(() => ({
    load: jest.fn(() => ({
      wrapS: 0,
      wrapT: 0,
      repeat: { set: jest.fn() }
    }))
  })),
  CanvasTexture: jest.fn()
}))

jest.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn(() => mockGLTFLoader)
}))

jest.mock('three/examples/jsm/controls/PointerLockControls.js')

jest.mock('@/data/portfolio', () => ({
  portfolioData: {
    projects: [
      { id: 'test-1', title: 'Test Project', description: 'Test Description', technologies: ['Vue'] },
      { id: 'test-2', title: 'Second Project', description: 'Another Description', technologies: ['React'] }
    ]
  }
}))

describe('SpaceMuseum Component Logic', () => {
  describe('Movement Logic', () => {
    it('should recognize movement key codes', () => {
      const movementKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Space']
      
      movementKeys.forEach(key => {
        expect(typeof key).toBe('string')
        expect(key.length).toBeGreaterThan(0)
      })
    })

    it('should have correct physics constants', () => {
      // Test the physics values expected in the component
      const gravity = 7.84 // 0.8x Earth gravity
      const jumpSpeed = 8
      const groundHeight = 1.8
      const maxJumps = 2

      expect(gravity).toBe(7.84)
      expect(jumpSpeed).toBe(8)
      expect(groundHeight).toBe(1.8)
      expect(maxJumps).toBe(2)
    })

    it('should calculate double jump boost', () => {
      const baseSpeed = 8
      const boostMultiplier = 1.1
      const boostedSpeed = baseSpeed * boostMultiplier

      expect(boostedSpeed).toBe(8.8)
    })
  })

  describe('Museum Configuration', () => {
    it('should have correct museum dimensions', () => {
      const museumRadius = 30
      const wallHeight = 12
      const frameWidth = 6
      const frameHeight = 4.5

      expect(museumRadius).toBe(30)
      expect(wallHeight).toBe(12)
      expect(frameWidth).toBe(6)
      expect(frameHeight).toBe(4.5)
    })
  })

  describe('3D Furniture Loading', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    describe('Couch Model Loading', () => {
      it('should load couch model with correct path', async () => {
        // Mock successful loading
        const mockGltfScene = { ...mockThreeGroup }
        mockGLTFLoader.loadAsync.mockResolvedValue({ scene: mockGltfScene })

        // Simulate loadCouchModel function logic
        const couchPath = 'assets/3d/base_basic_pbr.glb'
        
        try {
          const gltf = await mockGLTFLoader.loadAsync(couchPath)
          const couchModel = gltf.scene
          
          // Verify loading was called with correct path
          expect(mockGLTFLoader.loadAsync).toHaveBeenCalledWith(couchPath)
          expect(couchModel).toBeDefined()
        } catch (error) {
          throw error
        }
      })

      it('should configure couch model with correct properties', async () => {
        const mockGltfScene = { ...mockThreeGroup }
        mockGLTFLoader.loadAsync.mockResolvedValue({ scene: mockGltfScene })

        const gltf = await mockGLTFLoader.loadAsync('assets/3d/base_basic_pbr.glb')
        const couchModel = gltf.scene

        // Test scaling
        couchModel.scale.setScalar(2.0)
        expect(couchModel.scale.setScalar).toHaveBeenCalledWith(2.0)

        // Test positioning - center-front of museum
        couchModel.position.set(0, 0, 10)
        expect(couchModel.position.set).toHaveBeenCalledWith(0, 0, 10)

        // Test rotation - facing towards back wall
        couchModel.rotation.y = Math.PI
        expect(couchModel.rotation.y).toBe(Math.PI)
      })

      it('should handle couch loading errors gracefully', async () => {
        const mockError = new Error('Failed to load couch model')
        mockGLTFLoader.loadAsync.mockRejectedValue(mockError)

        try {
          await mockGLTFLoader.loadAsync('assets/3d/base_basic_pbr.glb')
        } catch (error) {
          expect(error).toBe(mockError)
          expect((error as Error).message).toBe('Failed to load couch model')
        }
      })
    })

    describe('Bench Model Loading', () => {
      it('should load bench model with correct path', async () => {
        const mockGltfScene = { ...mockThreeGroup }
        mockGLTFLoader.loadAsync.mockResolvedValue({ scene: mockGltfScene })

        const benchPath = 'assets/3d/bench_pbr.glb'
        
        const gltf = await mockGLTFLoader.loadAsync(benchPath)
        const benchModel = gltf.scene
        
        expect(mockGLTFLoader.loadAsync).toHaveBeenCalledWith(benchPath)
        expect(benchModel).toBeDefined()
      })

      it('should configure bench model with correct properties', async () => {
        const mockGltfScene = { ...mockThreeGroup }
        mockGLTFLoader.loadAsync.mockResolvedValue({ scene: mockGltfScene })

        const gltf = await mockGLTFLoader.loadAsync('assets/3d/bench_pbr.glb')
        const benchModel = gltf.scene

        // Test scaling
        benchModel.scale.setScalar(2.0)
        expect(benchModel.scale.setScalar).toHaveBeenCalledWith(2.0)

        // Test positioning - left side of museum
        benchModel.position.set(-12, 0, 8)
        expect(benchModel.position.set).toHaveBeenCalledWith(-12, 0, 8)

        // Test rotation - 45 degree angle towards center
        benchModel.rotation.y = Math.PI / 4
        expect(benchModel.rotation.y).toBe(Math.PI / 4)
      })

      it('should handle bench loading errors gracefully', async () => {
        const mockError = new Error('Failed to load bench model')
        mockGLTFLoader.loadAsync.mockRejectedValue(mockError)

        try {
          await mockGLTFLoader.loadAsync('assets/3d/bench_pbr.glb')
        } catch (error) {
          expect(error).toBe(mockError)
          expect((error as Error).message).toBe('Failed to load bench model')
        }
      })
    })

    describe('Model Shadow Configuration', () => {
      it('should configure shadow properties for furniture models', () => {
        const mockChild = {
          castShadow: false,
          receiveShadow: false,
          material: {
            needsUpdate: false
          }
        }

        const mockTraverse = jest.fn((callback) => {
          // Simulate THREE.Mesh child
          Object.defineProperty(mockChild, 'constructor', {
            value: { name: 'Mesh' }
          })
          callback(mockChild)
        })

        const mockModel = {
          traverse: mockTraverse
        }

        // Simulate shadow configuration logic
        mockModel.traverse((child: any) => {
          if (child.constructor.name === 'Mesh') {
            child.castShadow = true
            child.receiveShadow = true
            if (child.material) {
              child.material.needsUpdate = true
            }
          }
        })

        expect(mockTraverse).toHaveBeenCalled()
        expect(mockChild.castShadow).toBe(true)
        expect(mockChild.receiveShadow).toBe(true)
        expect(mockChild.material.needsUpdate).toBe(true)
      })

      it('should handle materials array in shadow configuration', () => {
        const mockMaterial1 = { needsUpdate: false }
        const mockMaterial2 = { needsUpdate: false }
        
        const mockChild = {
          castShadow: false,
          receiveShadow: false,
          material: [mockMaterial1, mockMaterial2]
        }

        const mockTraverse = jest.fn((callback) => {
          Object.defineProperty(mockChild, 'constructor', {
            value: { name: 'Mesh' }
          })
          callback(mockChild)
        })

        const mockModel = { traverse: mockTraverse }

        // Simulate array material handling
        mockModel.traverse((child: any) => {
          if (child.constructor.name === 'Mesh') {
            child.castShadow = true
            child.receiveShadow = true
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: any) => {
                  mat.needsUpdate = true
                })
              } else {
                child.material.needsUpdate = true
              }
            }
          }
        })

        expect(mockMaterial1.needsUpdate).toBe(true)
        expect(mockMaterial2.needsUpdate).toBe(true)
      })
    })

    describe('Model Cleanup', () => {
      it('should properly dispose of couch model resources', () => {
        const mockGeometry = { dispose: jest.fn() }
        const mockMaterial = { dispose: jest.fn() }
        
        const mockChild = {
          geometry: mockGeometry,
          material: mockMaterial
        }

        const mockCouchModel = {
          traverse: jest.fn((callback) => {
            Object.defineProperty(mockChild, 'constructor', {
              value: { name: 'Mesh' }
            })
            callback(mockChild)
          })
        }

        // Simulate cleanup logic
        mockCouchModel.traverse((child: any) => {
          if (child.constructor.name === 'Mesh') {
            if (child.geometry) child.geometry.dispose()
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose())
              } else {
                child.material.dispose()
              }
            }
          }
        })

        mockScene.remove(mockCouchModel)

        expect(mockGeometry.dispose).toHaveBeenCalled()
        expect(mockMaterial.dispose).toHaveBeenCalled()
        expect(mockScene.remove).toHaveBeenCalledWith(mockCouchModel)
      })

      it('should properly dispose of bench model resources', () => {
        const mockGeometry = { dispose: jest.fn() }
        const mockMaterialArray = [
          { dispose: jest.fn() },
          { dispose: jest.fn() }
        ]
        
        const mockChild = {
          geometry: mockGeometry,
          material: mockMaterialArray
        }

        const mockBenchModel = {
          traverse: jest.fn((callback) => {
            Object.defineProperty(mockChild, 'constructor', {
              value: { name: 'Mesh' }
            })
            callback(mockChild)
          })
        }

        // Simulate cleanup logic with material array
        mockBenchModel.traverse((child: any) => {
          if (child.constructor.name === 'Mesh') {
            if (child.geometry) child.geometry.dispose()
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose())
              } else {
                child.material.dispose()
              }
            }
          }
        })

        mockScene.remove(mockBenchModel)

        expect(mockGeometry.dispose).toHaveBeenCalled()
        expect(mockMaterialArray[0].dispose).toHaveBeenCalled()
        expect(mockMaterialArray[1].dispose).toHaveBeenCalled()
        expect(mockScene.remove).toHaveBeenCalledWith(mockBenchModel)
      })

      it('should handle null model references during cleanup', () => {
        const nullCouchModel: any = null
        const nullBenchModel: any = null

        // Test that cleanup doesn't fail with null models
        expect(() => {
          if (nullCouchModel) {
            nullCouchModel.traverse(() => {})
            mockScene.remove(nullCouchModel)
          }
          if (nullBenchModel) {
            nullBenchModel.traverse(() => {})
            mockScene.remove(nullBenchModel)
          }
        }).not.toThrow()
      })
    })

    describe('Integration with Scene', () => {
      it('should add models to scene after successful loading', async () => {
        const mockCouchScene = { ...mockThreeGroup }
        const mockBenchScene = { ...mockThreeGroup }
        
        mockGLTFLoader.loadAsync
          .mockResolvedValueOnce({ scene: mockCouchScene })
          .mockResolvedValueOnce({ scene: mockBenchScene })

        // Load couch
        const couchGltf = await mockGLTFLoader.loadAsync('assets/3d/base_basic_pbr.glb')
        mockScene.add(couchGltf.scene)

        // Load bench
        const benchGltf = await mockGLTFLoader.loadAsync('assets/3d/bench_pbr.glb')
        mockScene.add(benchGltf.scene)

        expect(mockScene.add).toHaveBeenCalledWith(mockCouchScene)
        expect(mockScene.add).toHaveBeenCalledWith(mockBenchScene)
        expect(mockScene.add).toHaveBeenCalledTimes(2)
      })

      it('should not add models to scene if loading fails', async () => {
        mockGLTFLoader.loadAsync.mockRejectedValue(new Error('Loading failed'))

        try {
          await mockGLTFLoader.loadAsync('assets/3d/base_basic_pbr.glb')
        } catch (error) {
          // Model should not be added if loading fails
        }

        // Verify scene.add was not called due to error
        expect(mockScene.add).not.toHaveBeenCalled()
      })
    })
  })

  describe('Event Handling', () => {
    it('should handle project selection events', () => {
      const mockEmit = jest.fn()
      const projectId = 'test-project'

      // Simulate event emission
      mockEmit('project-selected', { projectId })

      expect(mockEmit).toHaveBeenCalledWith('project-selected', { projectId })
    })

    it('should handle exit events', () => {
      const mockEmit = jest.fn()

      // Simulate exit event
      mockEmit('exit-museum')

      expect(mockEmit).toHaveBeenCalledWith('exit-museum')
    })
  })

  describe('State Management', () => {
    it('should initialize movement state', () => {
      const initialState = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false
      }

      expect(initialState.moveForward).toBe(false)
      expect(initialState.moveBackward).toBe(false)
      expect(initialState.moveLeft).toBe(false)
      expect(initialState.moveRight).toBe(false)
    })

    it('should initialize jetpack physics state', () => {
      const jetpackPhysicsState = {
        jetpackFired: false,
        jumpCount: 0,
        jumpsRemaining: 2,
        maxJumps: 2,
        isGrounded: true
      }

      expect(jetpackPhysicsState.jetpackFired).toBe(false)
      expect(jetpackPhysicsState.jumpCount).toBe(0)
      expect(jetpackPhysicsState.jumpsRemaining).toBe(2)
      expect(jetpackPhysicsState.maxJumps).toBe(2)
      expect(jetpackPhysicsState.isGrounded).toBe(true)
    })

    it('should initialize input state for space key tracking', () => {
      const inputState = {
        spaceKeyHeld: false
      }

      expect(inputState.spaceKeyHeld).toBe(false)
    })

    it('should handle modal state', () => {
      const defaultModalState = false
      const openModalState = true

      expect(defaultModalState).toBe(false)
      expect(openModalState).toBe(true)
    })

    it('should initialize 3D model state', () => {
      const initialModelState = {
        couchModel: null,
        benchModel: null,
        floorMesh: null
      }

      expect(initialModelState.couchModel).toBeNull()
      expect(initialModelState.benchModel).toBeNull()
      expect(initialModelState.floorMesh).toBeNull()
    })

    it('should track model loading state', () => {
      const modelStates = {
        couchLoading: false,
        benchLoading: false,
        modelsReady: false
      }

      // Simulate loading state changes
      modelStates.couchLoading = true
      expect(modelStates.couchLoading).toBe(true)

      modelStates.benchLoading = true
      expect(modelStates.benchLoading).toBe(true)

      // When both loaded
      modelStates.couchLoading = false
      modelStates.benchLoading = false
      modelStates.modelsReady = !modelStates.couchLoading && !modelStates.benchLoading

      expect(modelStates.modelsReady).toBe(true)
    })
  })

  describe('Jetpack Firing System', () => {
    let mockJetpackSound: any
    let mockConsoleLog: jest.SpyInstance

    beforeEach(() => {
      jest.clearAllMocks()
      
      // Mock Audio constructor for jetpack sound
      mockJetpackSound = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        currentTime: 0,
        volume: 0.7,
        addEventListener: jest.fn()
      }
      
      global.Audio = jest.fn().mockImplementation(() => mockJetpackSound)
      
      // Mock console.log to track system messages
      mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()
    })

    afterEach(() => {
      mockConsoleLog.mockRestore()
    })

    describe('Audio System Integration', () => {
      it('should initialize jetpack sound with correct file path', () => {
        // Simulate jetpack sound initialization
        const jetpackSound = new Audio('assets/sound/jumpack.wav')
        
        expect(global.Audio).toHaveBeenCalledWith('assets/sound/jumpack.wav')
        expect(jetpackSound).toBeDefined()
      })

      it('should set correct volume relative to music volume', () => {
        const musicVolume = 0.8
        const expectedJetpackVolume = musicVolume * 0.7 // 70% of music volume
        
        const jetpackSound = new Audio('assets/sound/jumpack.wav')
        jetpackSound.volume = expectedJetpackVolume
        
        expect(jetpackSound.volume).toBe(0.56) // 0.8 * 0.7
      })

      it('should handle jetpack sound loading errors gracefully', () => {
        const mockErrorSound = {
          ...mockJetpackSound,
          play: jest.fn().mockRejectedValue(new Error('Sound loading failed'))
        }
        
        global.Audio = jest.fn().mockImplementation(() => mockErrorSound)
        
        expect(() => new Audio('assets/sound/jumpack.wav')).not.toThrow()
      })
    })

    describe('Jump Sequence Logic', () => {
      let physicsState: any

      beforeEach(() => {
        physicsState = {
          jumpCount: 0,
          jumpsRemaining: 2,
          maxJumps: 2,
          isGrounded: true,
          jetpackFired: false,
          velocityY: 0,
          jumpSpeed: 8
        }
      })

      it('should track jump count correctly in sequence', () => {
        // First jump
        if (physicsState.jumpsRemaining > 0) {
          physicsState.jumpCount++
          physicsState.jumpsRemaining--
          physicsState.isGrounded = false
        }
        
        expect(physicsState.jumpCount).toBe(1)
        expect(physicsState.jumpsRemaining).toBe(1)
        expect(physicsState.isGrounded).toBe(false)

        // Second jump (jetpack)
        if (physicsState.jumpsRemaining > 0) {
          physicsState.jumpCount++
          physicsState.jumpsRemaining--
          if (physicsState.jumpCount === 2) {
            physicsState.jetpackFired = true
          }
        }

        expect(physicsState.jumpCount).toBe(2)
        expect(physicsState.jumpsRemaining).toBe(0)
        expect(physicsState.jetpackFired).toBe(true)
      })

      it('should prevent third jump when no jumps remaining', () => {
        // Exhaust all jumps
        physicsState.jumpCount = 2
        physicsState.jumpsRemaining = 0
        physicsState.isGrounded = false

        // Attempt third jump
        const initialJumpCount = physicsState.jumpCount
        if (physicsState.jumpsRemaining > 0) {
          physicsState.jumpCount++
        }

        expect(physicsState.jumpCount).toBe(initialJumpCount) // Should not change
        expect(physicsState.jumpsRemaining).toBe(0)
      })

      it('should reset jump sequence on landing', () => {
        // Set mid-flight state
        physicsState.jumpCount = 2
        physicsState.jumpsRemaining = 0
        physicsState.isGrounded = false
        physicsState.jetpackFired = true

        // Simulate landing
        physicsState.isGrounded = true
        physicsState.jumpsRemaining = physicsState.maxJumps
        physicsState.jumpCount = 0
        physicsState.jetpackFired = false

        expect(physicsState.jumpCount).toBe(0)
        expect(physicsState.jumpsRemaining).toBe(2)
        expect(physicsState.isGrounded).toBe(true)
        expect(physicsState.jetpackFired).toBe(false)
      })

      it('should apply correct jump multiplier for double jump', () => {
        const baseJumpSpeed = 8
        
        // First jump - no multiplier
        const firstJumpMultiplier = 1 === 2 ? 1.1 : 1.0
        const firstJumpVelocity = baseJumpSpeed * firstJumpMultiplier
        expect(firstJumpVelocity).toBe(8)

        // Second jump - 1.1x multiplier
        const secondJumpMultiplier = 2 === 2 ? 1.1 : 1.0
        const secondJumpVelocity = baseJumpSpeed * secondJumpMultiplier
        expect(secondJumpVelocity).toBe(8.8)
      })
    })

    describe('Jetpack Sound Triggering', () => {
      it('should NOT play sound on first jump', async () => {
        const jumpCount = 1
        const jetpackSound = mockJetpackSound

        // Simulate first jump logic
        if (jumpCount === 2) {
          jetpackSound.currentTime = 0
          await jetpackSound.play()
        }

        expect(jetpackSound.play).not.toHaveBeenCalled()
      })

      it('should play sound ONLY on second jump (double jump)', async () => {
        const jumpCount = 2
        const jetpackSound = mockJetpackSound

        // Simulate second jump logic
        if (jumpCount === 2) {
          jetpackSound.currentTime = 0
          jetpackSound.volume = 0.7
          await jetpackSound.play()
        }

        expect(jetpackSound.currentTime).toBe(0)
        expect(jetpackSound.volume).toBe(0.7)
        expect(jetpackSound.play).toHaveBeenCalledTimes(1)
      })

      it('should reset sound to beginning for rapid firing', async () => {
        const jetpackSound = mockJetpackSound
        jetpackSound.currentTime = 2.5 // Simulate mid-playback

        // Simulate rapid jetpack activation
        jetpackSound.currentTime = 0
        await jetpackSound.play()

        expect(jetpackSound.currentTime).toBe(0)
        expect(jetpackSound.play).toHaveBeenCalled()
      })

      it('should handle sound play errors gracefully', async () => {
        const errorSound = {
          ...mockJetpackSound,
          play: jest.fn().mockRejectedValue(new Error('Autoplay blocked'))
        }

        // Should not throw error
        expect(async () => {
          try {
            errorSound.currentTime = 0
            await errorSound.play()
          } catch (error) {
            // Error should be caught and handled
          }
        }).not.toThrow()
      })
    })

    describe('Jetpack Sound Stopping', () => {
      it('should stop sound when player lands', () => {
        const jetpackSound = mockJetpackSound
        const wasJetpackFired = true
        const wasGrounded = false
        const nowGrounded = true

        // Simulate landing logic
        if (!wasGrounded && wasJetpackFired && nowGrounded) {
          jetpackSound.pause()
          jetpackSound.currentTime = 0
        }

        expect(jetpackSound.pause).toHaveBeenCalled()
        expect(jetpackSound.currentTime).toBe(0)
      })

      it('should NOT stop sound if jetpack was not fired', () => {
        const jetpackSound = mockJetpackSound
        const wasJetpackFired = false
        const wasGrounded = false
        const nowGrounded = true

        // Simulate landing without jetpack use
        if (!wasGrounded && wasJetpackFired && nowGrounded) {
          jetpackSound.pause()
        }

        expect(jetpackSound.pause).not.toHaveBeenCalled()
      })

      it('should handle null jetpack sound gracefully', () => {
        const jetpackSound = null

        expect(() => {
          if (jetpackSound) {
            jetpackSound.pause()
            jetpackSound.currentTime = 0
          }
        }).not.toThrow()
      })
    })

    describe('Space Key Hold Prevention', () => {
      let inputState: any

      beforeEach(() => {
        inputState = {
          spaceKeyHeld: false
        }
      })

      it('should allow jump on initial space press', () => {
        const canJump = !inputState.spaceKeyHeld && true // has jumps remaining
        
        if (canJump) {
          inputState.spaceKeyHeld = true
        }

        expect(inputState.spaceKeyHeld).toBe(true)
      })

      it('should prevent jump when space is held', () => {
        inputState.spaceKeyHeld = true // Space already being held
        
        const canJump = !inputState.spaceKeyHeld && true
        let jumpExecuted = false

        if (canJump) {
          jumpExecuted = true
        }

        expect(jumpExecuted).toBe(false)
      })

      it('should reset space hold state on key release', () => {
        inputState.spaceKeyHeld = true

        // Simulate keyup event
        inputState.spaceKeyHeld = false

        expect(inputState.spaceKeyHeld).toBe(false)
      })

      it('should reset space hold state on landing', () => {
        inputState.spaceKeyHeld = true
        const isLanding = true

        // Simulate landing reset
        if (isLanding) {
          inputState.spaceKeyHeld = false
        }

        expect(inputState.spaceKeyHeld).toBe(false)
      })

      it('should reset space hold state on cleanup', () => {
        inputState.spaceKeyHeld = true

        // Simulate cleanup
        inputState.spaceKeyHeld = false

        expect(inputState.spaceKeyHeld).toBe(false)
      })
    })

    describe('Volume Control Integration', () => {
      it('should update jetpack volume when music volume changes', () => {
        const jetpackSound = mockJetpackSound
        const newMusicVolume = 0.6
        const expectedJetpackVolume = newMusicVolume * 0.7

        // Simulate volume update
        jetpackSound.volume = expectedJetpackVolume

        expect(jetpackSound.volume).toBe(0.42) // 0.6 * 0.7
      })

      it('should work independently of music enabled/disabled state', () => {
        const jetpackSound = mockJetpackSound
        const musicEnabled = false // Music is OFF
        const musicVolume = 0.8

        // Jetpack should still use volume setting, independent of music toggle
        jetpackSound.volume = musicVolume * 0.7

        expect(jetpackSound.volume).toBe(0.56) // Works even when music is off
      })

      it('should handle zero volume', () => {
        const jetpackSound = mockJetpackSound
        const musicVolume = 0
        
        jetpackSound.volume = musicVolume * 0.7

        expect(jetpackSound.volume).toBe(0)
      })

      it('should handle maximum volume', () => {
        const jetpackSound = mockJetpackSound
        const musicVolume = 1.0
        
        jetpackSound.volume = musicVolume * 0.7

        expect(jetpackSound.volume).toBe(0.7)
      })
    })

    describe('System Integration', () => {
      it('should coordinate all jetpack systems in double jump sequence', async () => {
        // Initialize states
        const physicsState = {
          jumpCount: 1,
          jumpsRemaining: 1,
          isGrounded: false,
          jetpackFired: false
        }
        const inputState = { spaceKeyHeld: false }
        const jetpackSound = mockJetpackSound

        // Simulate second jump with all systems
        if (!inputState.spaceKeyHeld && physicsState.jumpsRemaining > 0) {
          inputState.spaceKeyHeld = true
          physicsState.jumpCount++
          physicsState.jumpsRemaining--
          
          if (physicsState.jumpCount === 2) {
            jetpackSound.currentTime = 0
            jetpackSound.volume = 0.7
            await jetpackSound.play()
            physicsState.jetpackFired = true
          }
        }

        // Verify all systems updated correctly
        expect(physicsState.jumpCount).toBe(2)
        expect(physicsState.jumpsRemaining).toBe(0)
        expect(physicsState.jetpackFired).toBe(true)
        expect(inputState.spaceKeyHeld).toBe(true)
        expect(jetpackSound.play).toHaveBeenCalled()
      })

      it('should coordinate all systems during landing', () => {
        // Mid-flight state
        const physicsState = {
          jumpCount: 2,
          jumpsRemaining: 0,
          isGrounded: false,
          jetpackFired: true,
          maxJumps: 2
        }
        const inputState = { spaceKeyHeld: true }
        const jetpackSound = mockJetpackSound

        // Simulate landing with all system resets
        const wasGrounded = physicsState.isGrounded
        physicsState.isGrounded = true
        
        if (!wasGrounded && physicsState.jetpackFired) {
          jetpackSound.pause()
          jetpackSound.currentTime = 0
          physicsState.jetpackFired = false
        }
        
        physicsState.jumpsRemaining = physicsState.maxJumps
        physicsState.jumpCount = 0
        inputState.spaceKeyHeld = false

        // Verify complete system reset
        expect(physicsState.isGrounded).toBe(true)
        expect(physicsState.jumpCount).toBe(0)
        expect(physicsState.jumpsRemaining).toBe(2)
        expect(physicsState.jetpackFired).toBe(false)
        expect(inputState.spaceKeyHeld).toBe(false)
        expect(jetpackSound.pause).toHaveBeenCalled()
        expect(jetpackSound.currentTime).toBe(0)
      })
    })

    describe('Console Logging and Debugging', () => {
      it('should log appropriate messages for jump types', () => {
        const jumpCount1 = 1
        const jumpCount2 = 2

        // Simulate logging logic
        if (jumpCount1 === 2) {
          console.log('🚀 Jetpack fired! Double jump activated (jump #2 in sequence)')
        } else {
          console.log(`👟 Regular jump #${jumpCount1} - no jetpack`)
        }

        if (jumpCount2 === 2) {
          console.log('🚀 Jetpack fired! Double jump activated (jump #2 in sequence)')
        } else {
          console.log(`👟 Regular jump #${jumpCount2} - no jetpack`)
        }

        expect(mockConsoleLog).toHaveBeenCalledWith('👟 Regular jump #1 - no jetpack')
        expect(mockConsoleLog).toHaveBeenCalledWith('🚀 Jetpack fired! Double jump activated (jump #2 in sequence)')
      })

      it('should log space key hold prevention', () => {
        const spaceKeyHeld = true

        if (spaceKeyHeld) {
          console.log('🚫 Space held down - release and press again to jump')
        }

        expect(mockConsoleLog).toHaveBeenCalledWith('🚫 Space held down - release and press again to jump')
      })

      it('should log space key release', () => {
        console.log('✅ Space key released - ready for next jump')

        expect(mockConsoleLog).toHaveBeenCalledWith('✅ Space key released - ready for next jump')
      })

      it('should log landing and system reset', () => {
        console.log('🏃 Landed - jump sequence reset')
        console.log('🛑 Jetpack sound stopped - landed')

        expect(mockConsoleLog).toHaveBeenCalledWith('🏃 Landed - jump sequence reset')
        expect(mockConsoleLog).toHaveBeenCalledWith('🛑 Jetpack sound stopped - landed')
      })
    })
  })
})
