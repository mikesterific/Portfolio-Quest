<template>
  <div ref="museumContainer" class="space-museum-container">
    <canvas ref="museumCanvas" class="museum-canvas"></canvas>
    
    <!-- UI Overlay -->
    <div class="museum-ui-overlay">
      <!-- Crosshair -->
      <div class="crosshair">
        <div class="crosshair-dot"></div>
      </div>
      
      <!-- Settings Panel -->
      <div class="settings-panel" :class="{ active: showSettings }" @click.stop>
        <button @click.stop="toggleSettings" class="settings-toggle" :class="{ active: showSettings }">
          ⚙️ Settings
        </button>
        <div v-if="showSettings" class="settings-content" @click.stop>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="invertYAxis" 
                @change="saveSettings"
                class="setting-checkbox"
              />
              <span class="checkmark"></span>
              Invert Mouse Y-Axis
            </label>
            <p class="setting-description">Flight simulator style controls</p>
          </div>
          <div class="setting-item">
            <label class="setting-label-range">
              Mouse Sensitivity
              <input 
                type="range" 
                min="0.1" 
                max="3.0" 
                step="0.1" 
                v-model="mouseSensitivity" 
                @input="saveSettings"
                class="setting-range"
              />
              <span class="sensitivity-value">{{ mouseSensitivity }}x</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="musicEnabled" 
                @change="saveSettings"
                class="setting-checkbox"
              />
              <span class="checkmark"></span>
              Background Music
            </label>
            <p class="setting-description">Atmospheric space music for immersion</p>
          </div>
          <div class="setting-item">
            <label class="setting-label-range">
              Music Volume
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.1" 
                v-model="musicVolume" 
                @input="saveSettings"
                class="setting-range"
                :disabled="!musicEnabled"
              />
              <span class="sensitivity-value">{{ Math.round(musicVolume * 100) }}%</span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Interaction Prompt -->
      <div v-if="interactionPrompt" class="interaction-prompt" @click.stop>
        {{ interactionPrompt }}
      </div>
      
      <!-- Instructions -->
      <div class="instructions" @click.stop>
        <p>WASD: Move | Mouse: Look Around | SPACE: Jump | SHIFT: Hold to Run</p>
        <p>Click: Interact with Portfolio Pieces | ESC: Exit Museum | Gravity: 0.8x Earth (Space Station)</p>
        <p>Collision Detection: Walls & Ceiling | Double Jump Available</p>
      </div>
      
      <!-- Loading Screen -->
      <div v-if="isLoading" class="loading-screen" @click.stop>
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Loading Space Museum...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { portfolioData } from '@/data/portfolio'
import type { ProjectData } from '@/types/game'

interface MuseumState {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
  clock: THREE.Clock | null
  raycaster: THREE.Raycaster | null
  mouse: THREE.Vector2 | null
  portfolioFrames: Array<{
    mesh: THREE.Mesh
    projectData: ProjectData
  }>
  // 3D Models
  couchModels: THREE.Group[]
  benchModels: THREE.Group[]
  floorMesh: THREE.Mesh | null
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  jump: boolean
  velocity: THREE.Vector3
  // Running mechanic state
  isRunning: boolean
  currentSpeedMultiplier: number
  targetSpeedMultiplier: number
  speedTransitionRate: number
  physics: {
    velocityY: number
    isGrounded: boolean
    gravity: number
    jumpSpeed: number
    groundHeight: number
    jumpsRemaining: number
    maxJumps: number
  }
  // Custom camera controls
  yawObject: THREE.Object3D | null
  pitchObject: THREE.Object3D | null
  isPointerLocked: boolean
  // Background music state
  backgroundMusic: HTMLAudioElement | null
  soundEnabled: boolean

}

export default defineComponent({
  name: 'SpaceMuseum',
  props: {
    modalOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['project-selected', 'exit-museum'],
  setup(props, { emit }) {
    // Reactive refs
    const museumContainer = ref<HTMLDivElement>()
    const museumCanvas = ref<HTMLCanvasElement>()
    const isLoading = ref(true)
    const interactionPrompt = ref('') // Always empty - no proximity detection
    const showSettings = ref(false)
    const invertYAxis = ref(false)
    const mouseSensitivity = ref(1.0)
    const musicVolume = ref(0.4) // Slightly louder default volume
    const musicEnabled = ref(true) // Default to music ON for better experience
    
    // Museum state
    const state: MuseumState = {
      scene: null,
      camera: null,
      renderer: null,
      clock: null,
      raycaster: null,
      mouse: null,
      portfolioFrames: [],
      // 3D Models
      couchModels: [],
      benchModels: [],
      floorMesh: null,
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      jump: false,
      velocity: new THREE.Vector3(),
      // Running mechanic state
      isRunning: false,
      currentSpeedMultiplier: 1.0,
      targetSpeedMultiplier: 1.0,
      speedTransitionRate: 8.0,
      physics: {
        velocityY: 0,
        isGrounded: true,
        gravity: 7.84, // 0.8x Earth gravity for space station feel
        jumpSpeed: 8,
        groundHeight: 1.8, // Human eye height
        jumpsRemaining: 2, // Start with full jumps available
        maxJumps: 2 // Allow double jump
      },
      // Custom camera controls
      yawObject: null,
      pitchObject: null,
      isPointerLocked: false,
      // Background music state  
      backgroundMusic: null,
      soundEnabled: true // Default to sound ON for immersive experience
    }

    // Settings management
    const loadSettings = (): void => {
      try {
        const savedInvert = localStorage.getItem('museum-invert-y-axis')
        const savedSensitivity = localStorage.getItem('museum-mouse-sensitivity')
        const savedMusicVolume = localStorage.getItem('museum-music-volume')
        const savedMusicEnabled = localStorage.getItem('museum-music-enabled')
        
        if (savedInvert !== null) {
          invertYAxis.value = JSON.parse(savedInvert)
        }
        
        if (savedSensitivity !== null) {
          mouseSensitivity.value = parseFloat(savedSensitivity)
        }
        
        if (savedMusicVolume !== null) {
          musicVolume.value = parseFloat(savedMusicVolume)
        }
        
        if (savedMusicEnabled !== null) {
          musicEnabled.value = JSON.parse(savedMusicEnabled)
        } else {
          // First time user - ensure music is enabled by default and save it
          musicEnabled.value = true
          localStorage.setItem('museum-music-enabled', JSON.stringify(true))
        }
      } catch (error) {
        console.warn('Failed to load settings:', error)
      }
    }
    
    const saveSettings = (): void => {
      try {
        localStorage.setItem('museum-invert-y-axis', JSON.stringify(invertYAxis.value))
        localStorage.setItem('museum-mouse-sensitivity', mouseSensitivity.value.toString())
        localStorage.setItem('museum-music-volume', musicVolume.value.toString())
        localStorage.setItem('museum-music-enabled', JSON.stringify(musicEnabled.value))
        
        // Update music settings if audio is loaded
        if (state.backgroundMusic) {
          state.soundEnabled = musicEnabled.value
          
          if (musicEnabled.value) {
            // Music enabled: set volume and play if paused
            state.backgroundMusic.volume = musicVolume.value
            if (state.backgroundMusic.paused) {
              state.backgroundMusic.play().catch(error => {
                console.warn('[SpaceMuseum] Error resuming music:', error)
              })
            }
          } else {
            // Music disabled: pause the music
            state.backgroundMusic.pause()
          }
        }
      } catch (error) {
        console.warn('Failed to save settings:', error)
      }
    }
    
    const toggleSettings = (): void => {
      showSettings.value = !showSettings.value
    }

    // Background music management
    const initializeBackgroundMusic = async (): Promise<void> => {
      try {
        // Load settings first
        loadSettings()
        
        // Create background music audio element
        state.backgroundMusic = new Audio('/src/assets/sound/I like this one.mp3')
        state.backgroundMusic.loop = true
        state.backgroundMusic.volume = musicEnabled.value ? musicVolume.value : 0
        state.soundEnabled = musicEnabled.value
        
        // Handle loading errors
        state.backgroundMusic.addEventListener('error', (e) => {
          console.warn('[SpaceMuseum] Failed to load background music:', e)
        })
        
        // Start playing when ready if enabled
        if (musicEnabled.value) {
          try {
            await state.backgroundMusic.play()
          } catch (error) {
            console.warn('[SpaceMuseum] Autoplay blocked - music will start on user interaction:', error)
          }
        }
      } catch (error) {
        console.warn('[SpaceMuseum] Error initializing background music:', error)
      }
    }

    const playBackgroundMusic = async (): Promise<void> => {
      if (state.backgroundMusic && musicEnabled.value) {
        try {
          state.backgroundMusic.volume = musicVolume.value
          await state.backgroundMusic.play()
        } catch (error) {
          console.warn('[SpaceMuseum] Error playing background music:', error)
        }
      }
    }

    const stopBackgroundMusic = (): void => {
      if (state.backgroundMusic) {
        state.backgroundMusic.pause()
        state.backgroundMusic.currentTime = 0
      }
    }

    // Setup custom camera controls with yaw/pitch hierarchy
    const setupCustomCameraControls = (): void => {
      if (!museumContainer.value) return

      // Create camera
      state.camera = new THREE.PerspectiveCamera(
        75,
        museumContainer.value.clientWidth / museumContainer.value.clientHeight,
        0.1,
        1000
      )
      
      // Set camera rotation order for FPS controls
      state.camera.rotation.order = 'YXZ'
      
      // Create yaw object (horizontal rotation)
      state.yawObject = new THREE.Object3D()
      state.yawObject.position.set(0, 1.8, 0) // Center of circular museum at human height
      
      // Create pitch object (vertical rotation) 
      state.pitchObject = new THREE.Object3D()
      
      // Set up hierarchy: yaw -> pitch -> camera
      state.yawObject.add(state.pitchObject)
      state.pitchObject.add(state.camera)
      
      // Add yaw object to scene
      if (state.scene) {
        state.scene.add(state.yawObject)
      }
    }

    // Handle pointer lock events
    const onPointerLockChange = (): void => {
      state.isPointerLocked = document.pointerLockElement === museumCanvas.value
      if (!state.isPointerLocked) {
        interactionPrompt.value = ''
      } else {
        // User has entered the museum - try to start music if enabled
        playBackgroundMusic()
      }
    }

    // Handle mouse movement for camera rotation
    const onMouseMove = (event: MouseEvent): void => {
      if (!state.isPointerLocked || !state.yawObject || !state.pitchObject) return
      
      const sensitivity = mouseSensitivity.value * 0.002
      const movementX = event.movementX || 0
      const movementY = event.movementY || 0
      
      // Apply yaw (horizontal rotation)
      state.yawObject.rotation.y -= movementX * sensitivity
      
      // Apply pitch (vertical rotation) with inversion option
      const pitchDelta = movementY * sensitivity * (invertYAxis.value ? 1 : -1)
      state.pitchObject.rotation.x += pitchDelta
      
      // Clamp pitch to prevent camera flipping
      const maxPitch = Math.PI / 2 - 0.1 // Leave small margin
      state.pitchObject.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, state.pitchObject.rotation.x))
    }

    // Handle mouse clicks for interactions
    const onMouseClick = (event: MouseEvent): void => {
      // Don't handle clicks if modal is open
      if (props.modalOpen) return
      
      if (!state.raycaster || !state.camera || !state.mouse || !museumContainer.value) return
      
      // Update mouse coordinates for raycasting
      const rect = museumContainer.value.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      
      state.mouse.x = (x * 2) - 1
      state.mouse.y = -(y * 2) + 1
      
      state.raycaster.setFromCamera(state.mouse, state.camera)
      
      // Check for portfolio frame interactions first
      const portfolioIntersects = state.raycaster.intersectObjects(
        state.portfolioFrames.map(frame => frame.mesh)
      )
      
      if (portfolioIntersects.length > 0) {
        const clickedFrame = state.portfolioFrames.find(
          frame => frame.mesh === portfolioIntersects[0].object
        )
        
        if (clickedFrame) {
          handleProjectInteraction(clickedFrame.projectData.id)
          return // Don't grapple if clicking on portfolio
        }
      }
      

    }













    // Initialize the 3D museum
    const initializeMuseum = async (): Promise<void> => {
      if (!museumCanvas.value || !museumContainer.value) return

      try {
        // Initialize background music first
        await initializeBackgroundMusic()
        
        // Scene setup
        state.scene = new THREE.Scene()
        state.scene.fog = new THREE.Fog(0x000011, 50, 200)
        
        // Camera setup with yaw/pitch hierarchy
        setupCustomCameraControls()
        
        // Renderer setup
        state.renderer = new THREE.WebGLRenderer({ 
          canvas: museumCanvas.value,
          antialias: true
        })
        state.renderer.setSize(
          museumContainer.value.clientWidth,
          museumContainer.value.clientHeight
        )
        state.renderer.setClearColor(0x000011)
        state.renderer.shadowMap.enabled = true
        state.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        
        // Initialize other components
        state.clock = new THREE.Clock()
        state.raycaster = new THREE.Raycaster()
        state.mouse = new THREE.Vector2()
        
        // Build the museum environment
        await createMuseumEnvironment()
        await createPortfolioDisplays()
        await loadCouchModels() // Load the couch 3D models in center
        await loadBenchModels() // Load the bench 3D models in front of artworks
        setupLighting()
        setupEventListeners()
        
        // Start the render loop
        animate()
        
        // Ensure interaction prompt is cleared
        interactionPrompt.value = ''
        
        isLoading.value = false
      } catch (error) {
        console.error('Failed to initialize Space Museum:', error)
        isLoading.value = false
      }
    }

    // Create the museum environment (OPTIMIZED: rectangular walls, floor, ceiling)
    const createMuseumEnvironment = async (): Promise<void> => {
      if (!state.scene) return

      // OPTIMIZED: Rectangular dimensions for 94% geometry reduction (384→24 vertices)
      const width = 60      // Gallery width
      const depth = 40      // Gallery depth  
      const wallHeight = 12 // Keep same height
      const wallThickness = 0.5

      // Load professional textures (shared across all surfaces)
      const textureLoader = new THREE.TextureLoader()
      
      // OPTIMIZED: Rectangular Floor (4 vertices vs 64)
      const floorGeometry = new THREE.PlaneGeometry(width, depth)
      const floorTexture = textureLoader.load('/textures/floor/diffuse.jpg')
      floorTexture.wrapS = THREE.RepeatWrapping
      floorTexture.wrapT = THREE.RepeatWrapping
      floorTexture.repeat.set(8, 6) // Adjusted for rectangular aspect ratio
      
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: floorTexture,
        transparent: false
      })
      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = false // OPTIMIZED: Disabled shadows to reduce GPU usage
      floor.name = 'floor' // Name for raycaster identification
      
      // Store floor reference for collision detection
      state.floorMesh = floor
      state.scene.add(floor)

      // OPTIMIZED: Rectangular Ceiling (4 vertices vs 64)
      const ceilingGeometry = new THREE.PlaneGeometry(width, depth)
      const ceilingTexture = textureLoader.load('/textures/ceiling/diffuse.jpg')
      ceilingTexture.wrapS = THREE.RepeatWrapping
      ceilingTexture.wrapT = THREE.RepeatWrapping
      ceilingTexture.repeat.set(6, 4) // Adjusted for rectangular aspect ratio
      
      const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        map: ceilingTexture,
        transparent: false
      })
      const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial)
      ceiling.rotation.x = Math.PI / 2
      ceiling.position.y = wallHeight
      ceiling.receiveShadow = true
      state.scene.add(ceiling)

      // OPTIMIZED: 4 Rectangular Walls (16 vertices vs 128)
      const wallTexture = textureLoader.load('/textures/walls/diffuse.jpg')
      wallTexture.wrapS = THREE.RepeatWrapping
      wallTexture.wrapT = THREE.RepeatWrapping
      
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        side: THREE.BackSide // Only show inner surface
      })

      // Front Wall (portfolio wall)
      const frontWallGeometry = new THREE.PlaneGeometry(width, wallHeight)
      wallTexture.repeat.set(8, 2) // Horizontal repeat for wide wall
      const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial)
      frontWall.position.set(0, wallHeight / 2, depth / 2)
      frontWall.receiveShadow = true
      state.scene.add(frontWall)

      // Back Wall (portfolio wall)
      const backWallGeometry = new THREE.PlaneGeometry(width, wallHeight)
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial)
      backWall.position.set(0, wallHeight / 2, -depth / 2)
      backWall.rotation.y = Math.PI
      backWall.receiveShadow = true
      state.scene.add(backWall)

      // Left Wall (portfolio wall)
      const leftWallGeometry = new THREE.PlaneGeometry(depth, wallHeight)
      wallTexture.repeat.set(5, 2) // Adjusted for narrower wall
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial)
      leftWall.position.set(-width / 2, wallHeight / 2, 0)
      leftWall.rotation.y = Math.PI / 2
      leftWall.receiveShadow = true
      state.scene.add(leftWall)

      // Right Wall (portfolio wall)
      const rightWallGeometry = new THREE.PlaneGeometry(depth, wallHeight)
      const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial)
      rightWall.position.set(width / 2, wallHeight / 2, 0)
      rightWall.rotation.y = -Math.PI / 2
      rightWall.receiveShadow = true
      state.scene.add(rightWall)

      // Add ceiling lights and decorations
      createCeilingLights()
      createSpaceDecorations()


    }

    // Create ceiling lighting system (OPTIMIZED: rectangular grid layout)
    const createCeilingLights = (): void => {
      if (!state.scene) return

      const width = 60
      const depth = 40 
      const wallHeight = 12

      // Central ceiling light fixture
      const centralLightGeometry = new THREE.CylinderGeometry(2, 2, 0.3, 16)
      const centralLightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      })
      const centralLight = new THREE.Mesh(centralLightGeometry, centralLightMaterial)
      centralLight.position.set(0, wallHeight - 0.2, 0)
      state.scene.add(centralLight)

      // OPTIMIZED: Rectangular grid of ceiling lights (4 corner + 2 mid-wall)
      const lightPositions = [
        // 4 Corner lights for even illumination
        { x: width * 0.3, z: depth * 0.25 },    // Front-right corner
        { x: -width * 0.3, z: depth * 0.25 },   // Front-left corner
        { x: width * 0.3, z: -depth * 0.25 },   // Back-right corner
        { x: -width * 0.3, z: -depth * 0.25 },  // Back-left corner
        // 2 Mid-wall lights for portfolio illumination
        { x: 0, z: depth * 0.3 },               // Front center (for portfolio frames)
        { x: 0, z: -depth * 0.3 }               // Back center (for portfolio frames)
      ]

      lightPositions.forEach((pos, i) => {
        // Light fixture
        const lightFixtureGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 12)
        const lightFixtureMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xe8e8e8,
          transparent: true,
          opacity: 0.8
        })
        const lightFixture = new THREE.Mesh(lightFixtureGeometry, lightFixtureMaterial)
        lightFixture.position.set(pos.x, wallHeight - 0.1, pos.z)
        state.scene!.add(lightFixture)

        // Glowing light effect
        const glowGeometry = new THREE.SphereGeometry(0.3, 8, 8)
        const glowMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffaa,
          transparent: true,
          opacity: 0.4
        })
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        glow.position.set(pos.x, wallHeight - 0.3, pos.z)
        state.scene!.add(glow)
      })

      console.log('💡 Created rectangular ceiling light grid (6 lights + 1 central)')
    }

    // Create space-themed decorations
    const createSpaceDecorations = (): void => {
      if (!state.scene) return

      // Space decorations can be added here if needed in the future
    }

    // Load and position multiple couch 3D models in center facing outward
    const loadCouchModels = async (): Promise<void> => {
      if (!state.scene) return

      const loader = new GLTFLoader()
      
      try {
        console.log('🪑 Loading couch models...')
        const gltf = await loader.loadAsync('/src/assets/3d/base_basic_pbr.glb')
        
        // Define 4 couch positions in center facing outward
        const couchPositions = [
          { x: -6, z: -6, rotation: Math.PI * 3/4, name: 'front-left' },   // Facing front-left area
          { x: 6, z: -6, rotation: Math.PI / 4, name: 'front-right' },     // Facing front-right area
          { x: 6, z: 6, rotation: -Math.PI / 4, name: 'back-right' },      // Facing back-right area
          { x: -6, z: 6, rotation: -Math.PI * 3/4, name: 'back-left' }     // Facing back-left area
        ]
        
        couchPositions.forEach((position, index) => {
          // Clone the model for each position
          const couchModel = gltf.scene.clone()
          
          // Scale the couch appropriately for the museum space
          couchModel.scale.setScalar(2.0)
          
          // Position the couch according to the layout
          couchModel.position.set(position.x, 0, position.z)
          
          // Rotate the couch to face outward toward artwork
          couchModel.rotation.y = position.rotation
          
          // Enable shadows for the couch
          couchModel.traverse((child: any) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
              
              // Ensure materials are properly configured for lighting
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
          
          state.scene!.add(couchModel)
          state.couchModels.push(couchModel)
          
          console.log(`✅ Couch ${index + 1} (${position.name}) positioned at (${position.x}, ${position.z})`)
        })
        
        console.log(`✅ All ${couchPositions.length} couch models loaded successfully`)
        
      } catch (error) {
        console.error('❌ Failed to load couch models:', error)
      }
    }

    // Load and position multiple bench 3D models in front of each artwork
    const loadBenchModels = async (): Promise<void> => {
      if (!state.scene) return

      const loader = new GLTFLoader()
      
      try {
        console.log('🪑 Loading bench models...')
        const gltf = await loader.loadAsync('/src/assets/3d/bench_pbr.glb')
        
        // Define bench positions in front of each artwork (matching portfolio frame positions)
        const benchPositions = [
          // Front wall benches (facing front wall)
          { x: -15, z: 14, rotation: 0, wall: 'front-left' },
          { x: 0, z: 14, rotation: 0, wall: 'front-center' },
          { x: 15, z: 14, rotation: 0, wall: 'front-right' },
          
          // Back wall benches (facing back wall)
          { x: -15, z: -14, rotation: Math.PI, wall: 'back-left' },
          { x: 0, z: -14, rotation: Math.PI, wall: 'back-center' },
          { x: 15, z: -14, rotation: Math.PI, wall: 'back-right' },
          
          // Left wall benches (facing left wall)
          { x: -24, z: -8, rotation: Math.PI / 2, wall: 'left-front' },
          { x: -24, z: 8, rotation: Math.PI / 2, wall: 'left-back' },
          
          // Right wall benches (facing right wall)
          { x: 24, z: -8, rotation: -Math.PI / 2, wall: 'right-front' },
          { x: 24, z: 8, rotation: -Math.PI / 2, wall: 'right-back' }
        ]
        
        benchPositions.forEach((position, index) => {
          // Clone the model for each position
          const benchModel = gltf.scene.clone()
          
          // Scale the bench appropriately for the museum space
          benchModel.scale.setScalar(1.8) // Slightly smaller than couches
          
          // Position the bench in front of artwork
          benchModel.position.set(position.x, 0, position.z)
          
          // Rotate the bench to face the artwork
          benchModel.rotation.y = position.rotation
          
          // Enable shadows for the bench
          benchModel.traverse((child: any) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
              
              // Ensure materials are properly configured for lighting
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
          
          state.scene!.add(benchModel)
          state.benchModels.push(benchModel)
          
          console.log(`✅ Bench ${index + 1} (${position.wall}) positioned at (${position.x}, ${position.z})`)
        })
        
        console.log(`✅ All ${benchPositions.length} bench models loaded successfully`)
        
      } catch (error) {
        console.error('❌ Failed to load bench models:', error)
      }
    }

    // Create portfolio displays in professional grid layout on walls
    const createPortfolioDisplays = async (): Promise<void> => {
      if (!state.scene) return

      const projects = portfolioData.projects
      const totalProjects = projects.length
      
      // OPTIMIZED: Organize portfolio frames in gallery-style grid on 4 walls
      const wallConfigs = [
        // Front wall (3 frames)
        { 
          wall: 'front', 
          count: 3, 
          baseZ: 18, 
          baseRotation: Math.PI,
          positions: [
            { x: -15, y: 6 }, // Left frame
            { x: 0, y: 6 },   // Center frame
            { x: 15, y: 6 }   // Right frame
          ]
        },
        // Back wall (3 frames) 
        {
          wall: 'back',
          count: 3,
          baseZ: -18,
          baseRotation: 0,
          positions: [
            { x: -15, y: 6 }, // Left frame
            { x: 0, y: 6 },   // Center frame
            { x: 15, y: 6 }   // Right frame
          ]
        },
        // Left wall (2 frames)
        {
          wall: 'left', 
          count: 2,
          baseX: -28,
          baseRotation: Math.PI / 2,
          positions: [
            { z: -8, y: 6 }, // Front frame on left wall
            { z: 8, y: 6 }   // Back frame on left wall
          ]
        },
        // Right wall (2 frames)
        {
          wall: 'right',
          count: 2, 
          baseX: 28,
          baseRotation: -Math.PI / 2,
          positions: [
            { z: -8, y: 6 }, // Front frame on right wall
            { z: 8, y: 6 }   // Back frame on right wall  
          ]
        }
      ]
      
      let projectIndex = 0
      
      wallConfigs.forEach(wallConfig => {
        wallConfig.positions.forEach((pos, i) => {
          if (projectIndex < totalProjects) {
            const project = projects[projectIndex]
            
            const position = {
              x: (pos as any).x !== undefined ? (pos as any).x : (wallConfig.baseX || 0),
              z: (pos as any).z !== undefined ? (pos as any).z : (wallConfig.baseZ || 0),
              rotation: wallConfig.baseRotation
            }
            
            createPortfolioFrame(project, position, projectIndex, totalProjects)
            projectIndex++
          }
        })
      })
      
      console.log(`🖼️ Created ${projectIndex} portfolio frames in rectangular grid layout`)
    }

    // Create individual portfolio frame
    const createPortfolioFrame = (
      project: ProjectData,
      position: { x: number, z: number, rotation: number },
      index: number,
      totalFrames: number
    ): void => {
      if (!state.scene) return

      // Frame geometry - make them slightly smaller for the circular layout
      const frameWidth = 6
      const frameHeight = 4.5
      const frameGeometry = new THREE.PlaneGeometry(frameWidth, frameHeight)
      
      // Create a canvas texture for the project info
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 384
      const ctx = canvas.getContext('2d')!
      
      // Draw project information on canvas
      ctx.fillStyle = '#2c3e50'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add a subtle border
      ctx.strokeStyle = '#34495e'
      ctx.lineWidth = 8
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)
      
      ctx.fillStyle = '#ecf0f1'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(project.title, canvas.width / 2, 50)
      
      ctx.font = '16px Arial'
      ctx.fillStyle = '#bdc3c7'
      const words = project.description.split(' ')
      let line = ''
      let y = 100
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        
        if (testWidth > canvas.width - 60 && n > 0) {
          ctx.fillText(line, canvas.width / 2, y)
          line = words[n] + ' '
          y += 22
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, canvas.width / 2, y)
      
      // Technologies
      ctx.fillStyle = '#3498db'
      ctx.font = '14px Arial'
      const techText = project.technologies.join(' • ')
      ctx.fillText(techText, canvas.width / 2, y + 50)
      
      const texture = new THREE.CanvasTexture(canvas)
      const frameMaterial = new THREE.MeshLambertMaterial({ map: texture })
      
      const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial)
      
      // Position frame on circular wall
      frameMesh.position.set(position.x, 6, position.z) // Height of 6 units
      frameMesh.rotation.y = position.rotation
      
      // Add a subtle glow effect
      const glowGeometry = new THREE.PlaneGeometry(frameWidth + 0.5, frameHeight + 0.5)
      const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x3498db, 
        transparent: true, 
        opacity: 0.1 
      })
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
      glowMesh.position.copy(frameMesh.position)
      glowMesh.position.z -= 0.01 // Slightly behind the frame
      glowMesh.rotation.y = position.rotation
      
      state.scene.add(glowMesh)
      state.scene.add(frameMesh)
      state.portfolioFrames.push({
        mesh: frameMesh,
        projectData: project
      })
    }

    // Setup lighting
    const setupLighting = (): void => {
      if (!state.scene) return

      const radius = 30
      const wallHeight = 12

      // Professional gallery lighting (inspired by 3D Art Gallery)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      state.scene.add(ambientLight)

      // Central ceiling light (main illumination) - OPTIMIZED: Reduced shadow map resolution
      const centralLight = new THREE.PointLight(0xffffff, 2.0, 60)
      centralLight.position.set(0, wallHeight - 1, 0)
      centralLight.castShadow = true
      centralLight.shadow.mapSize.width = 1024  // REDUCED: Was 2048 (4MP → 1MP)
      centralLight.shadow.mapSize.height = 1024 // REDUCED: Was 2048 (4MP → 1MP)
      centralLight.shadow.camera.near = 0.1
      centralLight.shadow.camera.far = 60
      state.scene.add(centralLight)

      // Ring of ceiling lights for even distribution - OPTIMIZED: Selective shadows
      const lightCount = 8
      for (let i = 0; i < lightCount; i++) {
        const angle = (i / lightCount) * Math.PI * 2
        const lightRadius = radius * 0.7
        const x = Math.cos(angle) * lightRadius
        const z = Math.sin(angle) * lightRadius

        const ceilingLight = new THREE.PointLight(0xffffcc, 0.6, 25)
        ceilingLight.position.set(x, wallHeight - 1, z)
        
        // OPTIMIZED: Only cast shadows from cardinal direction lights (4 of 8)
        const shouldCastShadows = i % 2 === 0
        ceilingLight.castShadow = shouldCastShadows
        
        if (shouldCastShadows) {
          ceilingLight.shadow.mapSize.width = 512   // REDUCED: Was 1024 (1MP → 0.25MP)
          ceilingLight.shadow.mapSize.height = 512  // REDUCED: Was 1024 (1MP → 0.25MP)
        }
        
        state.scene.add(ceilingLight)
      }

      // Accent lights for portfolio frames
      const accentLight1 = new THREE.SpotLight(0x3498db, 0.8, 40, Math.PI / 6, 0.3)
      accentLight1.position.set(0, wallHeight - 2, 0)
      accentLight1.target.position.set(radius * 0.8, 6, 0)
      state.scene.add(accentLight1)
      state.scene.add(accentLight1.target)

      const accentLight2 = new THREE.SpotLight(0x3498db, 0.8, 40, Math.PI / 6, 0.3)
      accentLight2.position.set(0, wallHeight - 2, 0)
      accentLight2.target.position.set(-radius * 0.8, 6, 0)
      state.scene.add(accentLight2)
      state.scene.add(accentLight2.target)
    }

    // Setup event listeners
    const setupEventListeners = (): void => {
      if (!museumContainer.value) return

      // Pointer lock
      museumContainer.value.addEventListener('click', () => {
        if (!state.isPointerLocked) {
          museumCanvas.value?.requestPointerLock()
        }
      })

      // Pointer lock change events
      document.addEventListener('pointerlockchange', onPointerLockChange)
      document.addEventListener('pointerlockerror', () => {
        console.warn('Pointer lock failed')
      })

      // Keyboard controls
      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('keyup', onKeyUp)
      
      // Mouse controls for interaction
      document.addEventListener('click', onMouseClick)
      document.addEventListener('mousemove', onMouseMove)

      
      // ESC to exit
      document.addEventListener('keydown', (event) => {
        if (event.code === 'Escape' && state.isPointerLocked) {
          exitMuseum()
        }
      })
    }

    // Keyboard event handlers
    const onKeyDown = (event: KeyboardEvent): void => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          state.moveForward = true
          break
        case 'ArrowLeft':
        case 'KeyA':
          state.moveLeft = true
          break
        case 'ArrowDown':
        case 'KeyS':
          state.moveBackward = true
          break
        case 'ArrowRight':
        case 'KeyD':
          state.moveRight = true
          break
        case 'Space':
          event.preventDefault() // Prevent page scroll
          if (state.physics.jumpsRemaining > 0) {
            initiateJump()
          }
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          if (!state.isRunning) {
            state.isRunning = true
            state.targetSpeedMultiplier = 2.2
          }
          break

      }
    }

    const onKeyUp = (event: KeyboardEvent): void => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          state.moveForward = false
          break
        case 'ArrowLeft':
        case 'KeyA':
          state.moveLeft = false
          break
        case 'ArrowDown':
        case 'KeyS':
          state.moveBackward = false
          break
        case 'ArrowRight':
        case 'KeyD':
          state.moveRight = false
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          state.isRunning = false
          state.targetSpeedMultiplier = 1.0
          break
      }
    }

    // Handle project interaction - emit event instead of using game bridge
    const handleProjectInteraction = (projectId: string): void => {
      // Release pointer lock when opening a modal
      if (state.isPointerLocked) {
        document.exitPointerLock()
      }
      emit('project-selected', { projectId })
    }

    // Exit museum - emit event instead of using game bridge
    const exitMuseum = (): void => {
      emit('exit-museum')
    }

    // Jump mechanics
    const initiateJump = (): void => {
      if (state.physics.jumpsRemaining > 0) {
        // Second jump gets a slight boost for extra fun
        const jumpMultiplier = state.physics.jumpsRemaining === 1 ? 1.1 : 1.0
        state.physics.velocityY = state.physics.jumpSpeed * jumpMultiplier
        state.physics.jumpsRemaining--
        state.physics.isGrounded = false
      }
    }

    // Check boundary collision to prevent walking through walls, ceiling, and objects
    const checkBoundaryCollision = (currentPosition: THREE.Vector3, proposedMovement: THREE.Vector3): boolean => {
      const newPosition = currentPosition.clone().add(proposedMovement)
      
      // Museum dimensions (matching createMuseumEnvironment)
      const width = 60
      const depth = 40  
      const wallHeight = 12
      const buffer = 1.5 // Keep player away from walls
      
      // Check if new position would be outside boundaries
      const wallCollision = (
        newPosition.x < -width/2 + buffer || 
        newPosition.x > width/2 - buffer ||
        newPosition.z < -depth/2 + buffer || 
        newPosition.z > depth/2 - buffer
      )
      
      // Note: Couch collision removed - now handled by raycaster for jumping/landing
      return wallCollision
    }

    // Legacy collision function removed - now using raycaster for all furniture collision detection
    // Multiple furniture pieces are handled in the physics raycaster system

    // Check ceiling collision for vertical movement (jumping/gravity)
    const checkCeilingCollision = (currentY: number, proposedYMovement: number): boolean => {
      const newY = currentY + proposedYMovement
      const wallHeight = 12
      const ceilingHeight = wallHeight - 0.5 // Leave headroom
      
      return newY >= ceilingHeight
    }

    // Enhanced physics with raycaster surface detection
    const updatePhysics = (delta: number): void => {
      if (!state.camera || !state.yawObject || !state.scene) return

      // Create downward raycaster from player position
      const raycaster = new THREE.Raycaster()
      const playerPosition = state.yawObject.position.clone()
      
      // Cast ray downward from player (with slight forward offset for better detection)
      raycaster.set(playerPosition, new THREE.Vector3(0, -1, 0))
      
      // Get all objects that can be landed on
      const collidableObjects: THREE.Object3D[] = []
      
      // Add floor mesh
      if (state.floorMesh) {
        collidableObjects.push(state.floorMesh)
      }
      
      // Add all couch model meshes
      state.couchModels.forEach(couchModel => {
        couchModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.name = child.name || 'couch-part' // Name for identification
            collidableObjects.push(child)
          }
        })
      })
      
      // Add all bench model meshes
      state.benchModels.forEach(benchModel => {
        benchModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.name = child.name || 'bench-part' // Name for identification
            collidableObjects.push(child)
          }
        })
      })
      
      // Perform intersection test with increased ray distance
      const intersections = raycaster.intersectObjects(collidableObjects, true)
      
      let targetGroundLevel = 0 // Default floor level
      let landedOnSurface = null
      
      if (intersections.length > 0) {
        // Get the highest surface below the player
        const validIntersections = intersections.filter(intersection => 
          intersection.point.y <= playerPosition.y
        )
        
        if (validIntersections.length > 0) {
          const closestIntersection = validIntersections[0]
          targetGroundLevel = closestIntersection.point.y
          landedOnSurface = closestIntersection.object.name || 'unknown surface'
        }
      }
      
      const distanceToGround = playerPosition.y - targetGroundLevel
      const playerGroundHeight = state.physics.groundHeight
      
      // Apply gravity if not grounded or falling
      if (!state.physics.isGrounded || state.physics.velocityY < 0) {
        state.physics.velocityY -= state.physics.gravity * delta
        const proposedYMovement = state.physics.velocityY * delta
        
        // Check ceiling collision before applying vertical movement
        if (!checkCeilingCollision(state.yawObject.position.y, proposedYMovement)) {
          state.yawObject.position.y += proposedYMovement
        } else {
          // Hit ceiling - apply bounce-back effect
          const wallHeight = 12
          const ceilingHeight = wallHeight - 0.5
          state.yawObject.position.y = ceilingHeight
          state.physics.velocityY = -Math.abs(state.physics.velocityY) * 0.1
        }
      }
      
      // Enhanced ground/surface collision detection
      if (state.physics.velocityY <= 0 && distanceToGround <= playerGroundHeight + 0.1) {
        // Land on the detected surface
        state.yawObject.position.y = targetGroundLevel + playerGroundHeight
        state.physics.velocityY = 0
        state.physics.isGrounded = true
        state.physics.jumpsRemaining = state.physics.maxJumps // Reset jumps when landing
        
        // Optional: Log what surface we landed on (great for debugging!)
        if (landedOnSurface && landedOnSurface !== 'floor') {
          console.log(`🎯 Landed on: ${landedOnSurface} at height ${targetGroundLevel.toFixed(2)}`)
        }
      } else if (distanceToGround > playerGroundHeight + 0.1) {
        // Player is in the air
        state.physics.isGrounded = false
      }
      
      // MANDATORY ceiling collision enforcement
      const wallHeight = 12
      const ceilingHeight = wallHeight - 0.5
      if (state.yawObject.position.y > ceilingHeight) {
        state.yawObject.position.y = ceilingHeight
        state.physics.velocityY = Math.min(state.physics.velocityY, 0)
      }
    }

    // Animation loop
    const animate = (): void => {
      if (!state.scene || !state.camera || !state.renderer || !state.clock || !state.yawObject) return

      requestAnimationFrame(animate)

      const delta = state.clock.getDelta()

      // Update physics (gravity and jumping)
      updatePhysics(delta)

      // Update running speed transition
      state.currentSpeedMultiplier = THREE.MathUtils.lerp(
        state.currentSpeedMultiplier,
        state.targetSpeedMultiplier,
        state.speedTransitionRate * delta
      )

      // Handle horizontal movement
      state.velocity.x -= state.velocity.x * 10.0 * delta
      state.velocity.z -= state.velocity.z * 10.0 * delta

      const speed = 24.0 * state.currentSpeedMultiplier
      if (state.moveForward) state.velocity.z -= speed * delta
      if (state.moveBackward) state.velocity.z += speed * delta
      if (state.moveLeft) state.velocity.x -= speed * delta
      if (state.moveRight) state.velocity.x += speed * delta

      // Apply movement using the yaw object's local directions with collision detection
      const direction = new THREE.Vector3()
      direction.x = state.velocity.x * delta
      direction.z = state.velocity.z * delta
      direction.applyQuaternion(state.yawObject.quaternion)
      
      // Check collision before applying movement
      if (!checkBoundaryCollision(state.yawObject.position, direction)) {
        state.yawObject.position.add(direction)
      }

      state.renderer.render(state.scene, state.camera)
    }

    // Proximity detection removed - users click directly to interact

    // Handle window resize
    const handleResize = (): void => {
      if (!state.camera || !state.renderer || !museumContainer.value) return
      
      state.camera.aspect = museumContainer.value.clientWidth / museumContainer.value.clientHeight
      state.camera.updateProjectionMatrix()
      state.renderer.setSize(
        museumContainer.value.clientWidth,
        museumContainer.value.clientHeight
      )
    }

    // Cleanup
    const cleanup = (): void => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('click', onMouseClick)
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', handleResize)
      
      // Stop background music
      stopBackgroundMusic()
      
      // Dispose of 3D models
      state.couchModels.forEach(couchModel => {
        couchModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
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
        if (state.scene) {
          state.scene.remove(couchModel)
        }
      })
      state.couchModels = []
      
      // Dispose of bench models
      state.benchModels.forEach(benchModel => {
        benchModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
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
        if (state.scene) {
          state.scene.remove(benchModel)
        }
      })
      state.benchModels = []
      
      // Dispose of floor mesh
      if (state.floorMesh) {
        if (state.floorMesh.geometry) state.floorMesh.geometry.dispose()
        if (state.floorMesh.material) {
          if (Array.isArray(state.floorMesh.material)) {
            state.floorMesh.material.forEach(material => material.dispose())
          } else {
            state.floorMesh.material.dispose()
          }
        }
        if (state.scene) {
          state.scene.remove(state.floorMesh)
        }
        state.floorMesh = null
      }
      
      if (state.renderer) {
        state.renderer.dispose()
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      initializeMuseum()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      cleanup()
    })

    return {
      museumContainer,
      museumCanvas,
      isLoading,
      interactionPrompt,
      showSettings,
      invertYAxis,
      mouseSensitivity,
      musicVolume,
      musicEnabled,
      toggleSettings,
      saveSettings
    }
  }
})
</script>

<style scoped>
.space-museum-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.museum-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.museum-ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
}

.crosshair-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  opacity: 0.8;
}

.interaction-prompt {
  position: absolute;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(52, 73, 94, 0.9);
  color: #ecf0f1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  border: 2px solid #3498db;
  animation: pulse 2s infinite;
}

.instructions {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: #bdc3c7;
  font-size: 14px;
  line-height: 1.4;
}

.loading-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 17, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
  color: #ecf0f1;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #34495e;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

/* Settings Panel Styles */
.settings-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  pointer-events: auto;
}

.settings-toggle {
  background: rgba(52, 73, 94, 0.9);
  border: 2px solid #3498db;
  border-radius: 8px;
  color: #ecf0f1;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.settings-toggle:hover {
  background: rgba(52, 152, 219, 0.9);
  transform: translateY(-2px);
}

.settings-toggle.active {
  background: rgba(52, 152, 219, 0.9);
  border-color: #e74c3c;
}

.settings-content {
  margin-top: 10px;
  background: rgba(44, 62, 80, 0.95);
  border: 2px solid #34495e;
  border-radius: 8px;
  padding: 16px;
  min-width: 250px;
  backdrop-filter: blur(10px);
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: flex;
  align-items: center;
  color: #ecf0f1;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
}

.setting-checkbox {
  opacity: 0;
  position: absolute;
  cursor: pointer;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: #34495e;
  border: 2px solid #3498db;
  border-radius: 4px;
  margin-right: 10px;
  position: relative;
  transition: all 0.3s ease;
}

.setting-checkbox:checked + .checkmark {
  background-color: #3498db;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.setting-checkbox:checked + .checkmark:after {
  display: block;
}

.setting-description {
  margin: 4px 0 0 30px;
  font-size: 12px;
  color: #95a5a6;
  font-style: italic;
}

.setting-label-range {
  display: flex;
  flex-direction: column;
  color: #ecf0f1;
  font-size: 14px;
  font-weight: 500;
  gap: 8px;
}

.setting-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 5px;
  background: #34495e;
  outline: none;
  cursor: pointer;
}

.setting-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  transition: all 0.3s ease;
}

.setting-range::-webkit-slider-thumb:hover {
  background: #2980b9;
  transform: scale(1.1);
}

.setting-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.setting-range::-moz-range-thumb:hover {
  background: #2980b9;
  transform: scale(1.1);
}

.sensitivity-value {
  align-self: flex-end;
  font-size: 12px;
  color: #3498db;
  font-weight: bold;
  min-width: 30px;
  text-align: right;
}

.setting-range:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.setting-range:disabled::-webkit-slider-thumb {
  background: #7f8c8d;
  cursor: not-allowed;
}

.setting-range:disabled::-moz-range-thumb {
  background: #7f8c8d;
  cursor: not-allowed;
}
</style>
