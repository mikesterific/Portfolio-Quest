<template>
  <div ref="museumContainer" class="space-museum-container">
    <canvas ref="museumCanvas" class="museum-canvas"></canvas>
    
    <!-- UI Overlay -->
    <div class="museum-ui-overlay">
      <!-- Crosshair -->
      <div class="crosshair">
        <div class="crosshair-dot"></div>
      </div>
      
      <!-- Interaction Prompt -->
      <div v-if="interactionPrompt" class="interaction-prompt">
        {{ interactionPrompt }}
      </div>
      
      <!-- Instructions -->
      <div class="instructions">
        <p>WASD: Move | Mouse: Look Around | Click: Interact with Portfolio Pieces</p>
        <p>ESC: Exit Museum</p>
      </div>
      
      <!-- Loading Screen -->
      <div v-if="isLoading" class="loading-screen">
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
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { portfolioData } from '@/data/portfolio'
import type { ProjectData } from '@/types/game'

interface MuseumState {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
  controls: PointerLockControls | null
  clock: THREE.Clock | null
  raycaster: THREE.Raycaster | null
  mouse: THREE.Vector2 | null
  portfolioFrames: Array<{
    mesh: THREE.Mesh
    projectData: ProjectData
  }>
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  velocity: THREE.Vector3
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
    const interactionPrompt = ref('')
    
    // Museum state
    const state: MuseumState = {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      clock: null,
      raycaster: null,
      mouse: null,
      portfolioFrames: [],
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      velocity: new THREE.Vector3()
    }

    // Initialize the 3D museum
    const initializeMuseum = async (): Promise<void> => {
      if (!museumCanvas.value || !museumContainer.value) return

      try {
        // Scene setup
        state.scene = new THREE.Scene()
        state.scene.fog = new THREE.Fog(0x000011, 50, 200)
        
        // Camera setup
        state.camera = new THREE.PerspectiveCamera(
          75,
          museumContainer.value.clientWidth / museumContainer.value.clientHeight,
          0.1,
          1000
        )
        state.camera.position.set(0, 1.8, 0) // Center of circular museum at human height
        
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
        
        // Controls setup
        state.controls = new PointerLockControls(state.camera, state.renderer.domElement)
        
        // Initialize other components
        state.clock = new THREE.Clock()
        state.raycaster = new THREE.Raycaster()
        state.mouse = new THREE.Vector2()
        
        // Build the museum environment
        await createMuseumEnvironment()
        await createPortfolioDisplays()
        setupLighting()
        setupEventListeners()
        
        // Start the render loop
        animate()
        
        isLoading.value = false
      } catch (error) {
        console.error('Failed to initialize Space Museum:', error)
        isLoading.value = false
      }
    }

    // Create the museum environment (circular walls, floor, ceiling)
    const createMuseumEnvironment = async (): Promise<void> => {
      if (!state.scene) return

      const radius = 30
      const wallHeight = 12
      const wallThickness = 0.5

      // Circular Floor with professional texture
      const floorGeometry = new THREE.CircleGeometry(radius + wallThickness, 64)
      
      // Load professional floor texture
      const textureLoader = new THREE.TextureLoader()
      const floorTexture = textureLoader.load('/textures/floor/diffuse.jpg')
      floorTexture.wrapS = THREE.RepeatWrapping
      floorTexture.wrapT = THREE.RepeatWrapping
      floorTexture.repeat.set(8, 8)
      
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: floorTexture,
        transparent: false
      })
      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      state.scene.add(floor)

      // Circular Ceiling with professional texture
      const ceilingGeometry = new THREE.CircleGeometry(radius + wallThickness, 64)
      
      const ceilingTexture = textureLoader.load('/textures/ceiling/diffuse.jpg')
      ceilingTexture.wrapS = THREE.RepeatWrapping
      ceilingTexture.wrapT = THREE.RepeatWrapping
      ceilingTexture.repeat.set(4, 4)
      
      const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        map: ceilingTexture,
        transparent: false
      })
      const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial)
      ceiling.rotation.x = Math.PI / 2
      ceiling.position.y = wallHeight
      ceiling.receiveShadow = true
      state.scene.add(ceiling)

      // Inner Curved Wall (where portfolio frames are mounted)
      const innerWallGeometry = new THREE.CylinderGeometry(radius, radius, wallHeight, 64, 1, true)
      
      const wallTexture = textureLoader.load('/textures/walls/diffuse.jpg')
      wallTexture.wrapS = THREE.RepeatWrapping
      wallTexture.wrapT = THREE.RepeatWrapping
      wallTexture.repeat.set(16, 4)
      
      const innerWallMaterial = new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        side: THREE.BackSide // Only show inner surface
      })
      const innerWall = new THREE.Mesh(innerWallGeometry, innerWallMaterial)
      innerWall.position.y = wallHeight / 2
      innerWall.receiveShadow = true
      state.scene.add(innerWall)

      // Outer Wall for complete enclosure
      const outerWallGeometry = new THREE.CylinderGeometry(
        radius + wallThickness, 
        radius + wallThickness, 
        wallHeight, 
        64, 
        1, 
        true
      )
      const outerWallMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x2c3e50,
        transparent: true,
        opacity: 0.8,
        side: THREE.FrontSide // Only show outer surface
      })
      const outerWall = new THREE.Mesh(outerWallGeometry, outerWallMaterial)
      outerWall.position.y = wallHeight / 2
      outerWall.receiveShadow = true
      state.scene.add(outerWall)

      // Add ceiling lights and decorations
      createCeilingLights()
      createSpaceDecorations()
    }

    // Create ceiling lighting system
    const createCeilingLights = (): void => {
      if (!state.scene) return

      const radius = 30
      const wallHeight = 12
      const lightCount = 8

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

      // Ring of ceiling lights around the perimeter
      for (let i = 0; i < lightCount; i++) {
        const angle = (i / lightCount) * Math.PI * 2
        const lightRadius = radius * 0.7
        const x = Math.cos(angle) * lightRadius
        const z = Math.sin(angle) * lightRadius

        // Light fixture
        const lightFixtureGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 12)
        const lightFixtureMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xe8e8e8,
          transparent: true,
          opacity: 0.8
        })
        const lightFixture = new THREE.Mesh(lightFixtureGeometry, lightFixtureMaterial)
        lightFixture.position.set(x, wallHeight - 0.1, z)
        state.scene.add(lightFixture)

        // Glowing light effect
        const glowGeometry = new THREE.SphereGeometry(0.3, 8, 8)
        const glowMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffaa,
          transparent: true,
          opacity: 0.4
        })
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        glow.position.set(x, wallHeight - 0.3, z)
        state.scene.add(glow)
      }

      // Add some architectural details to the ceiling
      const ringGeometry = new THREE.RingGeometry(radius * 0.8, radius * 0.85, 64)
      const ringMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x3d5a80,
        transparent: true,
        opacity: 0.6
      })
      const decorativeRing = new THREE.Mesh(ringGeometry, ringMaterial)
      decorativeRing.rotation.x = Math.PI / 2
      decorativeRing.position.y = wallHeight - 0.05
      state.scene.add(decorativeRing)
    }

    // Create space-themed decorations
    const createSpaceDecorations = (): void => {
      if (!state.scene) return

      // Add floating particles/stars
      const starGeometry = new THREE.BufferGeometry()
      const starCount = 200
      const positions = new Float32Array(starCount * 3)
      
      for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200
        positions[i + 1] = Math.random() * 20
        positions[i + 2] = (Math.random() - 0.5) * 200
      }
      
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const starMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.8
      })
      
      const stars = new THREE.Points(starGeometry, starMaterial)
      state.scene.add(stars)
    }

    // Create portfolio displays around the circular wall
    const createPortfolioDisplays = async (): Promise<void> => {
      if (!state.scene) return

      const projects = portfolioData.projects
      const radius = 28 // Slightly inside the wall
      const totalProjects = projects.length
      
      projects.forEach((project, index) => {
        // Calculate angle for even distribution around the circle
        const angle = (index / totalProjects) * Math.PI * 2
        
        // Position on the circular wall
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        // Rotation to face inward toward center
        const rotation = angle + Math.PI
        
        const position = { x, z, rotation }
        createPortfolioFrame(project, position, index, totalProjects)
      })
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

      // Central ceiling light (main illumination)
      const centralLight = new THREE.PointLight(0xffffff, 2.0, 60)
      centralLight.position.set(0, wallHeight - 1, 0)
      centralLight.castShadow = true
      centralLight.shadow.mapSize.width = 2048
      centralLight.shadow.mapSize.height = 2048
      centralLight.shadow.camera.near = 0.1
      centralLight.shadow.camera.far = 60
      state.scene.add(centralLight)

      // Ring of ceiling lights for even distribution
      const lightCount = 8
      for (let i = 0; i < lightCount; i++) {
        const angle = (i / lightCount) * Math.PI * 2
        const lightRadius = radius * 0.7
        const x = Math.cos(angle) * lightRadius
        const z = Math.sin(angle) * lightRadius

        const ceilingLight = new THREE.PointLight(0xffffcc, 0.6, 25)
        ceilingLight.position.set(x, wallHeight - 1, z)
        ceilingLight.castShadow = true
        ceilingLight.shadow.mapSize.width = 1024
        ceilingLight.shadow.mapSize.height = 1024
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
      if (!state.controls || !museumContainer.value) return

      // Pointer lock
      museumContainer.value.addEventListener('click', () => {
        state.controls?.lock()
      })

      state.controls.addEventListener('lock', () => {
        interactionPrompt.value = ''
      })

      // Keyboard controls
      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('keyup', onKeyUp)
      
      // Mouse controls for interaction
      document.addEventListener('click', onMouseClick)
      document.addEventListener('mousemove', onMouseMove)
      
      // ESC to exit
      document.addEventListener('keydown', (event) => {
        if (event.code === 'Escape' && state.controls?.isLocked) {
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
      }
    }

    // Mouse event handlers
    const onMouseMove = (event: MouseEvent): void => {
      if (!state.mouse || !museumContainer.value) return
      
      state.mouse.x = (event.clientX / museumContainer.value.clientWidth) * 2 - 1
      state.mouse.y = -(event.clientY / museumContainer.value.clientHeight) * 2 + 1
    }

    const onMouseClick = (): void => {
      // Don't handle clicks if modal is open
      if (props.modalOpen) return
      
      if (!state.raycaster || !state.camera || !state.mouse) return
      
      state.raycaster.setFromCamera(state.mouse, state.camera)
      const intersects = state.raycaster.intersectObjects(
        state.portfolioFrames.map(frame => frame.mesh)
      )
      
      if (intersects.length > 0) {
        const clickedFrame = state.portfolioFrames.find(
          frame => frame.mesh === intersects[0].object
        )
        
        if (clickedFrame) {
          handleProjectInteraction(clickedFrame.projectData.id)
        }
      }
    }

    // Handle project interaction - emit event instead of using game bridge
    const handleProjectInteraction = (projectId: string): void => {
      // Release pointer lock when opening a modal
      if (state.controls && state.controls.isLocked) {
        document.exitPointerLock()
      }
      emit('project-selected', { projectId })
    }

    // Exit museum - emit event instead of using game bridge
    const exitMuseum = (): void => {
      emit('exit-museum')
    }

    // Animation loop
    const animate = (): void => {
      if (!state.scene || !state.camera || !state.renderer || !state.controls || !state.clock) return

      requestAnimationFrame(animate)

      const delta = state.clock.getDelta()

      // Handle movement
      state.velocity.x -= state.velocity.x * 10.0 * delta
      state.velocity.z -= state.velocity.z * 10.0 * delta

      const speed = 20.0
      if (state.moveForward) state.velocity.z -= speed * delta
      if (state.moveBackward) state.velocity.z += speed * delta
      if (state.moveLeft) state.velocity.x -= speed * delta
      if (state.moveRight) state.velocity.x += speed * delta

      state.controls.moveRight(-state.velocity.x * delta)
      state.controls.moveForward(-state.velocity.z * delta)

      // Check for nearby portfolio frames
      checkPortfolioProximity()

      state.renderer.render(state.scene, state.camera)
    }

    // Check proximity to portfolio frames
    const checkPortfolioProximity = (): void => {
      if (!state.camera) return
      
      const playerPosition = state.camera.position
      let nearestFrame = null as { mesh: THREE.Mesh; projectData: ProjectData } | null
      let minDistance = Infinity
      
      state.portfolioFrames.forEach(frame => {
        const distance = playerPosition.distanceTo(frame.mesh.position)
        if (distance < 15 && distance < minDistance) {
          minDistance = distance
          nearestFrame = frame
        }
      })
      
      if (nearestFrame) {
        interactionPrompt.value = `Click to explore: ${nearestFrame.projectData.title}`
      } else {
        interactionPrompt.value = ''
      }
    }

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
      interactionPrompt
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
</style>
