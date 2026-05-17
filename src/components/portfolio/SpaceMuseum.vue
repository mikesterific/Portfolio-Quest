<template>
  <div ref="museumContainer" class="space-museum-container">
    <canvas
      ref="museumCanvas"
      class="museum-canvas"
      tabindex="-1"
      aria-label="Space museum view"
    ></canvas>

    <!-- UI Overlay -->
    <div class="museum-ui-overlay">
      <button class="museum-back-button" @click.stop="exitMuseum" type="button">Back Home</button>

      <!-- Crosshair -->
      <div class="crosshair">
        <div class="crosshair-dot"></div>
      </div>

      <!-- Settings Panel -->
      <div class="settings-panel" :class="{ active: showSettings }" @click.stop>
        <button
          @click.stop="toggleSettings"
          class="settings-toggle"
          :class="{ active: showSettings }"
        >
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
        <p>
          Click: Interact with Portfolio Pieces | ESC: Exit Museum | Gravity: 0.8x Earth (Space
          Station)
        </p>
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
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { portfolioData } from "@/data/portfolio";
import type { ProjectData } from "@/types/game";

interface MuseumState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  clock: THREE.Clock | null;
  raycaster: THREE.Raycaster | null;
  mouse: THREE.Vector2 | null;
  portfolioFrames: Array<{
    mesh: THREE.Mesh;
    hitArea: THREE.Mesh;
    projectData: ProjectData;
  }>;
  // 3D Models
  couchModels: THREE.Group[];
  benchModels: THREE.Group[];
  thinkerModel: THREE.Group | null;
  mouseManModel: THREE.Group | null;
  cleoModel: THREE.Group | null;
  socratesModel: THREE.Group | null;
  starbucksModel: THREE.Group | null;
  floorMesh: THREE.Mesh | null;
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  velocity: THREE.Vector3;
  // Running mechanic state
  isRunning: boolean;
  currentSpeedMultiplier: number;
  targetSpeedMultiplier: number;
  speedTransitionRate: number;
  physics: {
    velocityY: number;
    isGrounded: boolean;
    gravity: number;
    jumpSpeed: number;
    groundHeight: number;
    jumpsRemaining: number;
    maxJumps: number;
    jetpackFired: boolean;
    jumpCount: number;
  };
  // Custom camera controls
  yawObject: THREE.Object3D | null;
  pitchObject: THREE.Object3D | null;
  isPointerLocked: boolean;
  // Background music state
  backgroundMusic: HTMLAudioElement | null;
  soundEnabled: boolean;
  // Jetpack sound effect
  jetpackSound: HTMLAudioElement | null;
  // Input state tracking
  inputState: {
    spaceKeyHeld: boolean;
  };
}

export default defineComponent({
  name: "SpaceMuseum",
  props: {
    modalOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["project-selected", "exit-museum"],
  setup(props, { emit }) {
    // Reactive refs
    const museumContainer = ref<HTMLDivElement>();
    const museumCanvas = ref<HTMLCanvasElement>();
    const isLoading = ref(true);
    const interactionPrompt = ref(""); // Always empty - no proximity detection
    const showSettings = ref(false);
    const invertYAxis = ref(false);
    const mouseSensitivity = ref(1.0);
    const musicVolume = ref(0.4); // Slightly louder default volume
    const musicEnabled = ref(true); // Default to music ON for better experience

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
      thinkerModel: null,
      mouseManModel: null,
      cleoModel: null,
      socratesModel: null,
      starbucksModel: null,
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
        maxJumps: 2, // Allow double jump
        jetpackFired: false, // Track if jetpack was used for this jump sequence
        jumpCount: 0, // Track which jump in sequence this is (0 = grounded, 1 = first jump, 2 = second jump)
      },
      // Input state tracking
      inputState: {
        spaceKeyHeld: false, // Track if space key is currently being held down
      },
      // Custom camera controls
      yawObject: null,
      pitchObject: null,
      isPointerLocked: false,
      // Background music state
      backgroundMusic: null,
      soundEnabled: true, // Default to sound ON for immersive experience
      // Jetpack sound effect
      jetpackSound: null,
    };

    // Settings management
    const loadSettings = (): void => {
      try {
        const savedInvert = localStorage.getItem("museum-invert-y-axis");
        const savedSensitivity = localStorage.getItem("museum-mouse-sensitivity");
        const savedMusicVolume = localStorage.getItem("museum-music-volume");
        const savedMusicEnabled = localStorage.getItem("museum-music-enabled");

        if (savedInvert !== null) {
          invertYAxis.value = JSON.parse(savedInvert);
        }

        if (savedSensitivity !== null) {
          mouseSensitivity.value = parseFloat(savedSensitivity);
        }

        if (savedMusicVolume !== null) {
          musicVolume.value = parseFloat(savedMusicVolume);
        }

        if (savedMusicEnabled !== null) {
          musicEnabled.value = JSON.parse(savedMusicEnabled);
        } else {
          // First time user - ensure music is enabled by default and save it
          musicEnabled.value = true;
          localStorage.setItem("museum-music-enabled", JSON.stringify(true));
        }
      } catch (error) {
        console.warn("Failed to load settings:", error);
      }
    };

    const saveSettings = (): void => {
      try {
        localStorage.setItem("museum-invert-y-axis", JSON.stringify(invertYAxis.value));
        localStorage.setItem("museum-mouse-sensitivity", mouseSensitivity.value.toString());
        localStorage.setItem("museum-music-volume", musicVolume.value.toString());
        localStorage.setItem("museum-music-enabled", JSON.stringify(musicEnabled.value));

        // Update music settings if audio is loaded
        if (state.backgroundMusic) {
          state.soundEnabled = musicEnabled.value;

          if (musicEnabled.value) {
            // Music enabled: set volume and play if paused
            state.backgroundMusic.volume = musicVolume.value;
            if (state.backgroundMusic.paused) {
              state.backgroundMusic.play().catch((error) => {
                console.warn("[SpaceMuseum] Error resuming music:", error);
              });
            }
          } else {
            // Music disabled: pause the music
            state.backgroundMusic.pause();
          }
        }

        // Update jetpack sound settings (independent of music toggle)
        if (state.jetpackSound) {
          state.jetpackSound.volume = musicVolume.value * 0.7;
        }
      } catch (error) {
        console.warn("Failed to save settings:", error);
      }
    };

    const toggleSettings = (): void => {
      showSettings.value = !showSettings.value;
    };

    // Background music management
    const initializeBackgroundMusic = async (): Promise<void> => {
      try {
        // Load settings first
        loadSettings();

        // Create background music audio element
        state.backgroundMusic = new Audio("assets/sound/I like this one.mp3");
        state.backgroundMusic.loop = true;
        state.backgroundMusic.volume = musicEnabled.value ? musicVolume.value : 0;
        state.soundEnabled = musicEnabled.value;

        // Initialize jetpack sound effect
        state.jetpackSound = new Audio("assets/sound/jumpack.wav");
        state.jetpackSound.volume = musicVolume.value * 0.7; // Always use volume setting, independent of music toggle

        // Handle loading errors
        state.backgroundMusic.addEventListener("error", (e) => {
          console.warn("[SpaceMuseum] Failed to load background music:", e);
        });

        // Start playing when ready if enabled
        if (musicEnabled.value) {
          try {
            await state.backgroundMusic.play();
          } catch (error) {
            console.warn(
              "[SpaceMuseum] Autoplay blocked - music will start on user interaction:",
              error,
            );
          }
        }
      } catch (error) {
        console.warn("[SpaceMuseum] Error initializing background music:", error);
      }
    };

    const playBackgroundMusic = async (): Promise<void> => {
      if (state.backgroundMusic && musicEnabled.value) {
        try {
          state.backgroundMusic.volume = musicVolume.value;
          await state.backgroundMusic.play();
        } catch (error) {
          console.warn("[SpaceMuseum] Error playing background music:", error);
        }
      }
    };

    const stopBackgroundMusic = (): void => {
      if (state.backgroundMusic) {
        state.backgroundMusic.pause();
        state.backgroundMusic.currentTime = 0;
      }
    };

    // Play jetpack sound effect
    const playJetpackSound = (): void => {
      if (state.jetpackSound) {
        try {
          state.jetpackSound.currentTime = 0; // Reset to start for rapid firing
          state.jetpackSound.volume = musicVolume.value * 0.7; // Respect volume settings
          state.jetpackSound.play().catch((error) => {
            console.warn("[SpaceMuseum] Error playing jetpack sound:", error);
          });
        } catch (error) {
          console.warn("[SpaceMuseum] Jetpack sound error:", error);
        }
      }
    };

    // Stop jetpack sound effect
    const stopJetpackSound = (): void => {
      if (state.jetpackSound) {
        try {
          state.jetpackSound.pause();
          state.jetpackSound.currentTime = 0; // Reset for next use
          console.log("🛑 Jetpack sound stopped - landed");
        } catch (error) {
          console.warn("[SpaceMuseum] Error stopping jetpack sound:", error);
        }
      }
    };

    // Setup custom camera controls with yaw/pitch hierarchy
    const setupCustomCameraControls = (): void => {
      if (!museumContainer.value) return;

      // Create camera with optimized clipping planes for better depth precision
      state.camera = new THREE.PerspectiveCamera(
        75,
        museumContainer.value.clientWidth / museumContainer.value.clientHeight,
        1.0, // Increased near plane for better depth precision (was 0.1)
        200, // Reduced far plane to match museum size (was 1000)
      );

      // Set camera rotation order for FPS controls
      state.camera.rotation.order = "YXZ";

      // Create yaw object (horizontal rotation)
      state.yawObject = new THREE.Object3D();
      state.yawObject.position.set(0, 1.8, 8); // In front of thinker centerpiece for proper frontal view

      // Create pitch object (vertical rotation)
      state.pitchObject = new THREE.Object3D();

      // Set up hierarchy: yaw -> pitch -> camera
      state.yawObject.add(state.pitchObject);
      state.pitchObject.add(state.camera);

      // Add yaw object to scene
      if (state.scene) {
        state.scene.add(state.yawObject);
      }
    };

    // Handle pointer lock events
    const onPointerLockChange = (): void => {
      state.isPointerLocked = document.pointerLockElement === museumCanvas.value;
      if (!state.isPointerLocked) {
        interactionPrompt.value = "";
      } else {
        // User has entered the museum - try to start music if enabled
        playBackgroundMusic();
      }
    };

    // Handle mouse movement for camera rotation
    const onMouseMove = (event: MouseEvent): void => {
      if (!state.isPointerLocked || !state.yawObject || !state.pitchObject) return;

      const sensitivity = mouseSensitivity.value * 0.002;
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      // Apply yaw (horizontal rotation)
      state.yawObject.rotation.y -= movementX * sensitivity;

      // Apply pitch (vertical rotation) with inversion option
      const pitchDelta = movementY * sensitivity * (invertYAxis.value ? 1 : -1);
      state.pitchObject.rotation.x += pitchDelta;

      // Clamp pitch to prevent camera flipping
      const maxPitch = Math.PI / 2 - 0.1; // Leave small margin
      state.pitchObject.rotation.x = Math.max(
        -maxPitch,
        Math.min(maxPitch, state.pitchObject.rotation.x),
      );
    };

    // Handle mouse clicks for interactions
    const onMouseClick = (event: MouseEvent): void => {
      // Don't handle clicks if modal is open
      if (props.modalOpen) return;

      // Only raycast while pointer lock is active. Otherwise the same click that calls
      // requestPointerLock() (e.g. after closing the project modal) would hit art beneath
      // the cursor and reopen the modal.
      if (!state.isPointerLocked) return;

      if (!state.raycaster || !state.camera || !state.mouse) return;

      // Pointer lock hides the cursor; interactions should come from the center crosshair.
      state.mouse.set(0, 0);

      state.raycaster.setFromCamera(state.mouse, state.camera);

      // Check for portfolio frame interactions first
      const portfolioIntersects = state.raycaster.intersectObjects(
        state.portfolioFrames.map((frame) => frame.hitArea),
      );

      if (portfolioIntersects.length > 0) {
        const clickedFrame = state.portfolioFrames.find(
          (frame) => frame.hitArea === portfolioIntersects[0].object,
        );

        if (clickedFrame) {
          handleProjectInteraction(clickedFrame.projectData.id);
          return; // Don't grapple if clicking on portfolio
        }
      }
    };

    // Initialize the 3D museum
    const initializeMuseum = async (): Promise<void> => {
      if (!museumCanvas.value || !museumContainer.value) return;

      try {
        // Initialize background music first
        await initializeBackgroundMusic();

        // Scene setup
        state.scene = new THREE.Scene();
        state.scene.fog = new THREE.Fog(0x000011, 50, 200);

        // Camera setup with yaw/pitch hierarchy
        setupCustomCameraControls();

        // BALANCED: Renderer setup for quality portfolio display with good FPS
        state.renderer = new THREE.WebGLRenderer({
          canvas: museumCanvas.value,
          antialias: true, // ENABLED for crisp portfolio images
          logarithmicDepthBuffer: false, // Still disabled for performance
          powerPreference: "high-performance",
          stencil: false, // Not needed, saves memory
          depth: true,
        });
        state.renderer.setSize(
          museumContainer.value.clientWidth,
          museumContainer.value.clientHeight,
        );
        state.renderer.setClearColor(0x000011);
        state.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // FIXED: Additional settings to prevent grey artifacts
        state.renderer.toneMapping = THREE.LinearToneMapping; // CLEAN: No tone mapping artifacts
        state.renderer.toneMappingExposure = 1.0; // NEUTRAL: No exposure artifacts

        // Shadows completely disabled for maximum performance
        state.renderer.shadowMap.enabled = false;

        // PERFORMANCE: Lower pixel ratio for better FPS
        state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reduced from 2.0 to 1.5

        // Initialize other components
        state.clock = new THREE.Clock();
        state.raycaster = new THREE.Raycaster();
        state.mouse = new THREE.Vector2();

        // Build the museum environment
        await createMuseumEnvironment();
        await createPortfolioDisplays();
        await loadCouchModels(); // Load the couch 3D models in center
        await loadBenchModels(); // Load the bench 3D models in front of artworks
        await loadThinkerModel(); // Load the thinker centerpiece model
        await loadMouseManModel(); // Load the man-holding-mouse model in corner
        await loadCleoModel(); // Load the cleo model in another corner
        await loadSocratesModel(); // Load the socrates model in back-left corner
        await loadStarbucksModel(); // Load the starbucks model in back-right corner
        setupLighting();
        setupEventListeners();

        // Start the render loop
        animate();

        // Ensure interaction prompt is cleared
        interactionPrompt.value = "";

        isLoading.value = false;
      } catch (error) {
        console.error("Failed to initialize Space Museum:", error);
        isLoading.value = false;
      }
    };

    // Create the museum environment (OPTIMIZED: rectangular walls, floor, ceiling)
    const createMuseumEnvironment = async (): Promise<void> => {
      if (!state.scene) return;

      // OPTIMIZED: Rectangular dimensions for 94% geometry reduction (384→24 vertices)
      const width = 60; // Gallery width
      const depth = 40; // Gallery depth
      const wallHeight = 12; // Keep same height
      const wallThickness = 0.5;

      // Load professional textures (shared across all surfaces)
      const textureLoader = new THREE.TextureLoader();

      // OPTIMIZED: Rectangular Floor (4 vertices vs 64) - CONSISTENT: No grey artifacts
      const floorGeometry = new THREE.PlaneGeometry(width, depth);
      const floorTexture = textureLoader.load("textures/floor/diffuse.jpg");
      floorTexture.wrapS = THREE.RepeatWrapping;
      floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.repeat.set(8, 6); // Adjusted for rectangular aspect ratio
      floorTexture.generateMipmaps = false; // DISABLED: Prevents texture pixelation
      floorTexture.minFilter = THREE.LinearFilter; // CLEAN: No mipmap artifacts
      floorTexture.magFilter = THREE.LinearFilter;

      const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture,
        transparent: false,
        roughness: 0.9, // ADDED: Highly diffuse to prevent grey artifacts
        metalness: 0.0, // ADDED: Non-metallic for clean color
        envMapIntensity: 0.0, // DISABLED: No environment reflection contamination
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = false; // OPTIMIZED: Disabled shadows to reduce GPU usage
      floor.name = "floor"; // Name for raycaster identification

      // Store floor reference for collision detection
      state.floorMesh = floor;
      state.scene.add(floor);

      // OPTIMIZED: Rectangular Ceiling (4 vertices vs 64) - FIXED: No grey artifacts
      const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
      const ceilingTexture = textureLoader.load("textures/ceiling/diffuse.jpg");
      ceilingTexture.wrapS = THREE.RepeatWrapping;
      ceilingTexture.wrapT = THREE.RepeatWrapping;
      ceilingTexture.repeat.set(6, 4); // Adjusted for rectangular aspect ratio
      ceilingTexture.generateMipmaps = false; // DISABLED: Prevents texture pixelation
      ceilingTexture.minFilter = THREE.LinearFilter; // CLEAN: No mipmap artifacts
      ceilingTexture.magFilter = THREE.LinearFilter;

      const ceilingMaterial = new THREE.MeshStandardMaterial({
        map: ceilingTexture,
        transparent: false,
        roughness: 0.9, // ADDED: Highly diffuse to prevent grey artifacts
        metalness: 0.0, // ADDED: Non-metallic for clean color
        envMapIntensity: 0.0, // DISABLED: No environment reflection contamination
      });
      const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = wallHeight;
      ceiling.receiveShadow = false; // DISABLED: Prevents grey shadow artifacts
      state.scene.add(ceiling);

      // OPTIMIZED: 4 Rectangular Walls (16 vertices vs 128) - FIXED: No grey pixelation
      const wallTexture = textureLoader.load("textures/walls/diffuse.jpg");
      wallTexture.wrapS = THREE.RepeatWrapping;
      wallTexture.wrapT = THREE.RepeatWrapping;
      wallTexture.generateMipmaps = false; // DISABLED: Prevents texture pixelation
      wallTexture.minFilter = THREE.LinearFilter; // CLEAN: No mipmap artifacts
      wallTexture.magFilter = THREE.LinearFilter;

      const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        side: THREE.BackSide, // Only show inner surface
        roughness: 0.9, // ADDED: Highly diffuse to prevent grey artifacts
        metalness: 0.0, // ADDED: Non-metallic for clean color
        envMapIntensity: 0.0, // DISABLED: No environment reflection contamination
      });

      // Front Wall (portfolio wall)
      const frontWallGeometry = new THREE.PlaneGeometry(width, wallHeight);
      wallTexture.repeat.set(8, 2); // Horizontal repeat for wide wall
      const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
      frontWall.position.set(0, wallHeight / 2, depth / 2);
      frontWall.receiveShadow = false; // DISABLED: Prevents grey shadow artifacts
      state.scene.add(frontWall);

      // Back Wall (portfolio wall)
      const backWallGeometry = new THREE.PlaneGeometry(width, wallHeight);
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.set(0, wallHeight / 2, -depth / 2);
      backWall.rotation.y = Math.PI;
      backWall.receiveShadow = false; // DISABLED: Prevents grey shadow artifacts
      state.scene.add(backWall);

      // Left Wall (portfolio wall)
      const leftWallGeometry = new THREE.PlaneGeometry(depth, wallHeight);
      wallTexture.repeat.set(5, 2); // Adjusted for narrower wall
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.position.set(-width / 2, wallHeight / 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.receiveShadow = false; // DISABLED: Prevents grey shadow artifacts
      state.scene.add(leftWall);

      // Right Wall (portfolio wall)
      const rightWallGeometry = new THREE.PlaneGeometry(depth, wallHeight);
      const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
      rightWall.position.set(width / 2, wallHeight / 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.receiveShadow = false; // DISABLED: Prevents grey shadow artifacts
      state.scene.add(rightWall);

      // Add ceiling lights and decorations
      createCeilingLights();
      createSpaceDecorations();
    };

    // OPTIMIZED: Minimal ceiling decorations (visual only, no actual lights)
    const createCeilingLights = (): void => {
      if (!state.scene) return;

      const width = 60;
      const depth = 40;
      const wallHeight = 12;

      // PERFORMANCE: Single merged geometry for all ceiling fixtures
      const fixtureGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 8); // Reduced segments
      const fixtureMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffee,
        transparent: false, // No transparency for better performance
      });

      // Create only 3 visual fixtures (decorative only)
      const positions = [
        { x: 0, z: 0 }, // Center
        { x: -width * 0.25, z: 0 }, // Left
        { x: width * 0.25, z: 0 }, // Right
      ];

      positions.forEach((pos) => {
        const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
        fixture.position.set(pos.x, wallHeight - 0.2, pos.z);
        state.scene!.add(fixture);
      });

      console.log("💡 OPTIMIZED: Created 3 decorative ceiling fixtures (visual only)");
    };

    // Create space-themed decorations
    const createSpaceDecorations = (): void => {
      if (!state.scene) return;

      // Space decorations can be added here if needed in the future
    };

    // Load and position multiple couch 3D models in center facing outward
    const loadCouchModels = async (): Promise<void> => {
      if (!state.scene) return;

      const loader = new GLTFLoader();

      try {
        console.log("🪑 Loading couch models...");
        const gltf = await loader.loadAsync("assets/3d/base_basic_pbr.glb");

        // Define expanded couch positions - original 4 + 5 new ones for better space filling
        const couchPositions = [
          // Original 4 couches in center square formation
          { x: -6, z: -6, rotation: (Math.PI * 3) / 4, name: "front-left" }, // Facing front-left area
          { x: 6, z: -6, rotation: Math.PI / 4, name: "front-right" }, // Facing front-right area
          { x: 6, z: 6, rotation: -Math.PI / 4, name: "back-right" }, // Facing back-right area
          { x: -6, z: 6, rotation: (-Math.PI * 3) / 4, name: "back-left" }, // Facing back-left area

          // 4 new couches to fill the space better (removed center-forward behind thinker)
          { x: -15, z: 0, rotation: Math.PI / 2, name: "mid-left" }, // Left side facing right toward center
          { x: 15, z: 0, rotation: -Math.PI / 2, name: "mid-right" }, // Right side facing left toward center
          { x: 0, z: 10, rotation: Math.PI, name: "front-center" }, // Front area facing front wall
          { x: 0, z: -10, rotation: 0, name: "back-center" }, // Back area facing back wall
        ];

        couchPositions.forEach((position, index) => {
          // Clone the model for each position
          const couchModel = gltf.scene.clone();

          // Scale the couch appropriately for the museum space
          couchModel.scale.setScalar(2.0);

          // Position the couch according to the layout
          couchModel.position.set(position.x, 0, position.z);

          // Rotate the couch to face outward toward artwork
          couchModel.rotation.y = position.rotation;

          // Enable shadows for the couch
          couchModel.traverse((child: any) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              // Ensure materials are properly configured for lighting
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat: any) => {
                    mat.needsUpdate = true;
                  });
                } else {
                  child.material.needsUpdate = true;
                }
              }
            }
          });

          state.scene!.add(couchModel);
          state.couchModels.push(couchModel);

          console.log(
            `✅ Couch ${index + 1} (${position.name}) positioned at (${position.x}, ${position.z})`,
          );
        });

        console.log(`✅ All ${couchPositions.length} couch models loaded successfully`);
      } catch (error) {
        console.error("❌ Failed to load couch models:", error);
      }
    };

    // Load and position multiple bench 3D models in front of each artwork
    const loadBenchModels = async (): Promise<void> => {
      if (!state.scene) return;

      const loader = new GLTFLoader();

      try {
        console.log("🪑 Loading bench models...");
        const gltf = await loader.loadAsync("assets/3d/bench_pbr.glb");

        // Define bench positions in front of each artwork (matching portfolio frame positions)
        const benchPositions = [
          // Front wall benches (facing front wall)
          { x: -15, z: 14, rotation: 0, wall: "front-left" },
          { x: 0, z: 14, rotation: 0, wall: "front-center" },
          { x: 15, z: 14, rotation: 0, wall: "front-right" },

          // Back wall benches (facing back wall)
          { x: -15, z: -14, rotation: Math.PI, wall: "back-left" },
          { x: 0, z: -14, rotation: Math.PI, wall: "back-center" },
          { x: 15, z: -14, rotation: Math.PI, wall: "back-right" },

          // Left wall benches (facing left wall)
          { x: -24, z: -8, rotation: Math.PI / 2, wall: "left-front" },
          { x: -24, z: 8, rotation: Math.PI / 2, wall: "left-back" },

          // Right wall benches (facing right wall)
          { x: 24, z: -8, rotation: -Math.PI / 2, wall: "right-front" },
          { x: 24, z: 8, rotation: -Math.PI / 2, wall: "right-back" },
        ];

        benchPositions.forEach((position, index) => {
          // Clone the model for each position
          const benchModel = gltf.scene.clone();

          // Scale the bench appropriately for the museum space
          benchModel.scale.setScalar(1.8); // Slightly smaller than couches

          // Position the bench in front of artwork
          benchModel.position.set(position.x, 0, position.z);

          // Rotate the bench to face the artwork
          benchModel.rotation.y = position.rotation;

          // Enable shadows for the bench
          benchModel.traverse((child: any) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              // Ensure materials are properly configured for lighting
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat: any) => {
                    mat.needsUpdate = true;
                  });
                } else {
                  child.material.needsUpdate = true;
                }
              }
            }
          });

          state.scene!.add(benchModel);
          state.benchModels.push(benchModel);

          console.log(
            `✅ Bench ${index + 1} (${position.wall}) positioned at (${position.x}, ${position.z})`,
          );
        });

        console.log(`✅ All ${benchPositions.length} bench models loaded successfully`);
      } catch (error) {
        console.error("❌ Failed to load bench models:", error);
      }
    };

    // Enhance material properties for better light reflection and response
    const enhanceMaterialForLighting = (material: any): void => {
      // Convert to MeshStandardMaterial if it's basic material for better lighting
      if (material.type === "MeshBasicMaterial") {
        // Can't convert directly, but we can enhance existing properties
        console.log("⚠️ Material is MeshBasicMaterial - lighting may be limited");
      }

      // Enhanced lighting properties for better reflection
      if (material.type === "MeshStandardMaterial" || material.type === "MeshPhysicalMaterial") {
        // Make surface more reflective to light
        material.metalness = Math.min(material.metalness + 0.2, 0.8); // Increase metallic properties
        material.roughness = Math.max(material.roughness - 0.3, 0.1); // Smoother surface for better reflection
        material.envMapIntensity = 1.5; // Enhanced environment reflection
      } else if (material.type === "MeshPhongMaterial" || material.type === "MeshLambertMaterial") {
        // For Phong materials, increase shininess and reflectivity
        if (material.shininess !== undefined) {
          material.shininess = Math.min(material.shininess + 30, 100); // More reflective
        }
        if (material.reflectivity !== undefined) {
          material.reflectivity = Math.min(material.reflectivity + 0.3, 1.0); // Higher reflectivity
        }
      }

      // Universal enhancements
      material.transparent = false; // Ensure solid reflection
      material.needsUpdate = true;

      console.log(
        `🔧 Enhanced material: ${material.type} - metalness: ${material.metalness}, roughness: ${material.roughness}`,
      );
    };

    // OPTIMIZED: Reduced lighting for better performance
    const setupInvisibleThinkerLighting = (): void => {
      if (!state.scene) return;

      // PERFORMANCE: Reduced from 7 to 2 lights (71% reduction)
      const invisibleLights = [
        // Single key light from front
        {
          position: { x: 0, y: 6, z: 4 },
          color: 0xffffff,
          intensity: 1.44, // Increased by 20% (1.2 × 1.2)
          type: "point",
          distance: 15,
        },
        // Single fill light from above
        {
          position: { x: 0, y: 8, z: 0 },
          color: 0xffffcc,
          intensity: 0.96, // Increased by 20% (0.8 × 1.2)
          type: "point",
          distance: 12,
        },
      ];

      invisibleLights.forEach((lightConfig, index) => {
        const light = new THREE.PointLight(
          lightConfig.color,
          lightConfig.intensity,
          lightConfig.distance,
        );
        light.position.set(lightConfig.position.x, lightConfig.position.y, lightConfig.position.z);

        state.scene!.add(light);
      });

      console.log(
        `✨ OPTIMIZED: Added ${invisibleLights.length} lights for Thinker (reduced from 7, +20% brighter)`,
      );
    };

    // Load and position man-holding-mouse 3D model in corner
    const loadMouseManModel = async (): Promise<void> => {
      if (!state.scene) return;

      const loader = new GLTFLoader();

      try {
        console.log("🐭 Loading man-holding-mouse model...");
        const gltf = await loader.loadAsync("assets/3d/man-holding-mouse.glb");

        const mouseManModel = gltf.scene.clone();

        // Scale appropriately for the museum space (doubled size)
        mouseManModel.scale.setScalar(4.4);

        // Position in front-left corner, facing the center (toward the thinker)
        mouseManModel.position.set(-22, 0, 15); // Front-left corner

        // Rotate to face the center where the thinker is located (another 45 degrees left)
        mouseManModel.rotation.y = (3 * Math.PI) / 4; // 135 degrees total (another 45 degrees more left)

        // Enhance materials for better light reflection
        mouseManModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Apply the same material enhancement as the thinker
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: any) => {
                  enhanceMaterialForLighting(mat);
                });
              } else {
                enhanceMaterialForLighting(child.material);
              }
            }
          }
        });

        state.scene!.add(mouseManModel);
        state.mouseManModel = mouseManModel;

        // Set up invisible lighting specifically for the mouse man
        setupInvisibleMouseManLighting();

        console.log("✅ Man-holding-mouse model positioned in front-left corner facing center");
      } catch (error) {
        console.error("❌ Failed to load man-holding-mouse model:", error);
      }
    };

    // OPTIMIZED: Minimal lighting for mouse man model
    const setupInvisibleMouseManLighting = (): void => {
      // PERFORMANCE: Lighting removed - rely on ambient and main scene lights
      console.log(`✨ OPTIMIZED: Mouse man using ambient lighting only (100% reduction)`);
    };

    // Load and position Cleo 3D model in corner
    const loadCleoModel = async (): Promise<void> => {
      if (!state.scene) return;

      const loader = new GLTFLoader();

      try {
        console.log("👸 Loading Cleo model...");
        const gltf = await loader.loadAsync("assets/3d/cleo.glb");

        const cleoModel = gltf.scene.clone();

        // Scale to same size as mouse man (doubled size)
        cleoModel.scale.setScalar(4.4);

        // Position in front-right corner, facing inward
        cleoModel.position.set(22, 0, 15); // Front-right corner

        // Rotate to face the center area (90 degrees right from previous position)
        cleoModel.rotation.y = (-3 * Math.PI) / 4; // -135 degrees total (90 degrees more to the right)

        // Enhance materials for better light reflection
        cleoModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Apply enhanced material with geometry-smoothing properties
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: any) => {
                  enhanceMaterialForLighting(mat);
                  // Additional smoothing for Cleo to minimize geometric imperfections
                  if (mat.roughness !== undefined) {
                    mat.roughness = Math.max(mat.roughness + 0.1, 0.3); // Slightly more diffuse
                  }
                });
              } else {
                enhanceMaterialForLighting(child.material);
                // Additional smoothing for Cleo to minimize geometric imperfections
                if (child.material.roughness !== undefined) {
                  child.material.roughness = Math.max(child.material.roughness + 0.1, 0.3);
                }
              }
            }
          }
        });

        state.scene!.add(cleoModel);
        state.cleoModel = cleoModel;

        // Set up invisible lighting specifically for Cleo
        setupInvisibleCleoLighting();

        console.log("✅ Cleo model positioned in front-right corner facing center");
      } catch (error) {
        console.error("❌ Failed to load Cleo model:", error);
      }
    };

    // OPTIMIZED: Minimal lighting for Cleo model
    const setupInvisibleCleoLighting = (): void => {
      // PERFORMANCE: Lighting removed - rely on ambient and main scene lights
      console.log(`✨ OPTIMIZED: Cleo using ambient lighting only (100% reduction)`);
    };

    // Load and position Socrates 3D model in back-left corner
    const loadSocratesModel = async (): Promise<void> => {
      if (!state.scene) return;

      const loader = new GLTFLoader();

      try {
        console.log("🏛️ Loading Socrates model...");
        const gltf = await loader.loadAsync("assets/3d/socrotes.glb");

        const socratesModel = gltf.scene.clone();

        // Scale to match cleo and mouse man (doubled size)
        socratesModel.scale.setScalar(4.4);

        // Position in back-left corner, facing center
        socratesModel.position.set(-22, 0, -15); // Back-left corner

        // Rotate to face the center area (45 degrees toward center)
        socratesModel.rotation.y = Math.PI / 4; // 45 degrees toward center

        // Enhance materials for better light reflection
        socratesModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Apply the same material enhancement as other models
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: any) => {
                  enhanceMaterialForLighting(mat);
                });
              } else {
                enhanceMaterialForLighting(child.material);
              }
            }
          }
        });

        state.scene!.add(socratesModel);
        state.socratesModel = socratesModel;

        // Set up invisible lighting specifically for Socrates
        setupInvisibleSocratesLighting();

        console.log("✅ Socrates model positioned in back-left corner facing center");
      } catch (error) {
        console.error("❌ Failed to load Socrates model:", error);
      }
    };

    // OPTIMIZED: Minimal lighting for Socrates model
    const setupInvisibleSocratesLighting = (): void => {
      // PERFORMANCE: Lighting removed - rely on ambient and main scene lights
      console.log(`✨ OPTIMIZED: Socrates using ambient lighting only (100% reduction)`);
    };

    // Load and position Starbucks 3D model in back-right corner
    const loadStarbucksModel = async (): Promise<void> => {
      if (!state.scene) return;

      const loader = new GLTFLoader();

      try {
        console.log("☕ Loading Starbucks model...");
        const gltf = await loader.loadAsync("assets/3d/starbucks.glb");

        const starbucksModel = gltf.scene.clone();

        // Scale to match other corner models
        starbucksModel.scale.setScalar(4.4);

        // Position in back-right corner, facing center
        starbucksModel.position.set(22, 0, -15); // Back-right corner

        // Rotate to face the center area (45 degrees toward center, rotated 90° left from original)
        starbucksModel.rotation.y = -Math.PI / 4; // -45 degrees toward center

        // Enhance materials for better light reflection
        starbucksModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Apply the same material enhancement as other models
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: any) => {
                  enhanceMaterialForLighting(mat);
                });
              } else {
                enhanceMaterialForLighting(child.material);
              }
            }
          }
        });

        state.scene!.add(starbucksModel);
        state.starbucksModel = starbucksModel;

        // Set up invisible lighting specifically for Starbucks
        setupInvisibleStarbucksLighting();

        console.log(
          "✅ Starbucks model positioned in back-right corner as developer culture tribute",
        );
      } catch (error) {
        console.error("❌ Failed to load Starbucks model:", error);
      }
    };

    // OPTIMIZED: Minimal lighting for Starbucks model
    const setupInvisibleStarbucksLighting = (): void => {
      // PERFORMANCE: Lighting removed - rely on ambient and main scene lights
      console.log(`✨ OPTIMIZED: Starbucks using ambient lighting only (100% reduction)`);
    };

    // Load and position thinker 3D model as centerpiece
    const loadThinkerModel = async (): Promise<void> => {
      if (!state.scene) return;

      const loader = new GLTFLoader();

      try {
        console.log("🎭 Loading thinker model...");
        const gltf = await loader.loadAsync("assets/3d/thinker.glb");

        const thinkerModel = gltf.scene.clone();

        // Scale for centerpiece prominence (slightly larger than couches)
        thinkerModel.scale.setScalar(2.5);

        // Center position between couches for focal point
        thinkerModel.position.set(0, 0, 0);

        // Face museum entrance for immediate visual impact
        thinkerModel.rotation.y = 0;

        // Enable shadows and enhance PBR materials for better light reflection
        thinkerModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Enhance materials for better light reflection and response
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: any) => {
                  enhanceMaterialForLighting(mat);
                });
              } else {
                enhanceMaterialForLighting(child.material);
              }
            }
          }
        });

        state.scene!.add(thinkerModel);
        state.thinkerModel = thinkerModel;

        console.log("✅ Thinker centerpiece positioned at museum center (0, 0, 0)");
      } catch (error) {
        console.error("❌ Failed to load thinker model:", error);
      }
    };

    // Create portfolio displays in professional grid layout on walls
    const createPortfolioDisplays = async (): Promise<void> => {
      if (!state.scene) return;

      const projects = portfolioData.projects;
      const totalProjects = projects.length;

      // Calculate optimal artwork height (30% lower than center for better viewing)
      const wallHeight = 12; // From createMuseumEnvironment
      const centerHeight = wallHeight / 2; // Perfect vertical center: 6 units
      const artworkHeight = centerHeight - centerHeight * 0.3; // 30% lower than center: 4.2 units

      // OPTIMIZED: Organize portfolio frames in gallery-style grid on 4 walls
      const wallConfigs = [
        // Front wall (3 frames)
        {
          wall: "front",
          count: 3,
          baseZ: 18,
          baseRotation: Math.PI,
          positions: [
            { x: -15, y: artworkHeight }, // Left frame - vertically centered
            { x: 0, y: artworkHeight }, // Center frame - vertically centered
            { x: 15, y: artworkHeight }, // Right frame - vertically centered
          ],
        },
        // Back wall (3 frames)
        {
          wall: "back",
          count: 3,
          baseZ: -18,
          baseRotation: 0,
          positions: [
            { x: -15, y: artworkHeight }, // Left frame - vertically centered
            { x: 0, y: artworkHeight }, // Center frame - vertically centered
            { x: 15, y: artworkHeight }, // Right frame - vertically centered
          ],
        },
        // Left wall (3 frames — matches portfolio.html exhibit count incl. Portfolio Quest + 11 works)
        {
          wall: "left",
          count: 3,
          baseX: -28,
          baseRotation: Math.PI / 2,
          positions: [
            { z: -8, y: artworkHeight }, // Left wall toward front corner
            { z: 0, y: artworkHeight }, // Left wall midpoint
            { z: 8, y: artworkHeight }, // Left wall toward back corner
          ],
        },
        // Right wall (3 frames)
        {
          wall: "right",
          count: 3,
          baseX: 28,
          baseRotation: -Math.PI / 2,
          positions: [
            { z: -8, y: artworkHeight }, // Right wall toward front corner
            { z: 0, y: artworkHeight }, // Right wall midpoint
            { z: 8, y: artworkHeight }, // Right wall toward back corner
          ],
        },
      ];

      let projectIndex = 0;

      wallConfigs.forEach((wallConfig) => {
        wallConfig.positions.forEach((pos, i) => {
          if (projectIndex < totalProjects) {
            const project = projects[projectIndex];

            const position = {
              x: (pos as any).x !== undefined ? (pos as any).x : wallConfig.baseX || 0,
              y: (pos as any).y !== undefined ? (pos as any).y : artworkHeight,
              z: (pos as any).z !== undefined ? (pos as any).z : wallConfig.baseZ || 0,
              rotation: wallConfig.baseRotation,
            };

            createPortfolioFrame(project, position, projectIndex, totalProjects);
            projectIndex++;
          }
        });
      });

      console.log(`🖼️ Created ${projectIndex} portfolio frames in rectangular grid layout`);
    };

    // Create individual portfolio frame
    const createPortfolioFrame = (
      project: ProjectData,
      position: { x: number; y: number; z: number; rotation: number },
      index: number,
      totalFrames: number,
    ): void => {
      if (!state.scene) return;

      // Frame geometry - custom aspect ratio optimized for portfolio content
      const frameWidth = 8;
      const frameHeight = 4.17; // Custom aspect ratio (854/445 ≈ 1.92:1)
      const frameGeometry = new THREE.PlaneGeometry(frameWidth, frameHeight);

      // High-quality canvas for portfolio showcase images - ENHANCED: Better color handling
      const canvas = document.createElement("canvas");
      canvas.width = 1024; // Full resolution for crisp portfolio images
      canvas.height = 512; // Maintains 2:1 widescreen aspect ratio
      const ctx = canvas.getContext("2d", {
        alpha: false, // DISABLED: No alpha channel needed, prevents blending artifacts
        colorSpace: "srgb", // KEPT: Explicit sRGB color space for accuracy
      })!;

      // Helper function to draw text-based frame
      const drawTextBasedFrame = () => {
        // Draw project information on canvas with improved widescreen layout - FIXED: Pure black background
        ctx.fillStyle = "#000000"; // RESTORED: Pure black to eliminate grey artifacts
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add a subtle border - ENHANCED: Cleaner border
        ctx.strokeStyle = "#1a1a1a"; // CHANGED: Very dark grey for subtle definition
        ctx.lineWidth = 4; // REDUCED: Thinner border to minimize grey artifacts
        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

        // Project title - larger for widescreen format
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText(project.title, canvas.width / 2, 80);

        let nextY = 120;
        if (project.roles?.length) {
          ctx.fillStyle = "#3498db";
          ctx.font = "bold 22px Arial";
          ctx.fillText(project.roles.join(" · "), canvas.width / 2, nextY);
          nextY = 158;
        }

        // Description with improved wrapping for wider format
        ctx.font = "18px Arial";
        ctx.fillStyle = "#bdc3c7";
        const words = project.description.split(" ");
        let line = "";
        let y = nextY + 20;
        const maxWidth = canvas.width - 80; // More padding for widescreen

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, canvas.width / 2, y);
            line = words[n] + " ";
            y += 25;
          } else {
            line = testLine;
          }

          // Prevent text from going too low
          if (y > canvas.height - 100) break;
        }
        ctx.fillText(line, canvas.width / 2, y);

        // Technologies at bottom
        ctx.fillStyle = "#3498db";
        ctx.font = "16px Arial";
        const techText = project.technologies.join(" • ");
        ctx.fillText(techText, canvas.width / 2, canvas.height - 40);
      };

      // Start with text-based frame
      drawTextBasedFrame();

      // High-quality texture settings for portfolio images - BALANCED: Clean + smooth
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false; // DISABLED: Prevents pixelation artifacts
      texture.minFilter = THREE.LinearFilter; // RESTORED: Smooth rendering
      texture.magFilter = THREE.LinearFilter; // RESTORED: Smooth rendering
      texture.wrapS = THREE.ClampToEdgeWrapping; // ADDED: Prevents edge artifacts
      texture.wrapT = THREE.ClampToEdgeWrapping;
      // REMOVED: flipY setting to maintain correct orientation

      // Phase 2: Use MeshStandardMaterial for better image fidelity - ENHANCED
      const frameMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.0, // Non-metallic for accurate image display
        roughness: 1.0, // INCREASED: Fully diffuse to prevent color shifts
        envMapIntensity: 0.0, // DISABLED: Removes environment color bleeding
      });

      const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);

      // Try to load project image asynchronously if available
      if (project.image) {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Handle CORS if needed

        img.onload = () => {
          // Clear canvas and draw the project image - SMART: Context-aware background
          ctx.fillStyle = "#000000"; // RESTORED: Pure black for clean backgrounds
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image to fit canvas while maintaining aspect ratio
          const imgAspect = img.width / img.height;
          const canvasAspect = canvas.width / canvas.height;

          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;

          if (imgAspect > canvasAspect) {
            // Image is wider than canvas
            drawHeight = canvas.width / imgAspect;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            // Image is taller than canvas
            drawWidth = canvas.height * imgAspect;
            offsetX = (canvas.width - drawWidth) / 2;
          }

          // ENHANCED: Better image rendering - OPTIMIZED: Reduced artifacts
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.globalCompositeOperation = "source-over"; // ADDED: Ensure clean pixel replacement
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          // Roles overlay (readable on screenshots)
          const rolesText = project.roles?.filter(Boolean).join(" · ");
          if (rolesText) {
            const marginX = 48;
            ctx.textAlign = "center";
            ctx.font = "bold 20px Arial";
            let displayRoles = rolesText;
            while (
              ctx.measureText(displayRoles).width > canvas.width - marginX * 2 &&
              displayRoles.length > 24
            ) {
              displayRoles = displayRoles.slice(0, -4).trim() + "…";
            }
            const barPadY = 14;
            const textBlockH = 28;
            const barTop = canvas.height - textBlockH - barPadY * 2;
            ctx.fillStyle = "rgba(0,0,0,0.72)";
            ctx.fillRect(0, barTop, canvas.width, canvas.height - barTop);
            ctx.fillStyle = "#ecf0f1";
            ctx.fillText(displayRoles, canvas.width / 2, canvas.height - barPadY - 6);
          }

          // High-quality texture update for loaded images - OPTIMIZED: Consistent clean rendering
          const newTexture = new THREE.CanvasTexture(canvas);
          newTexture.colorSpace = THREE.SRGBColorSpace;
          newTexture.generateMipmaps = false; // DISABLED: Prevents pixelation artifacts
          newTexture.minFilter = THREE.LinearFilter; // CONSISTENT: Smooth rendering
          newTexture.magFilter = THREE.LinearFilter; // CONSISTENT: Smooth rendering
          newTexture.wrapS = THREE.ClampToEdgeWrapping; // ADDED: Prevents edge artifacts
          newTexture.wrapT = THREE.ClampToEdgeWrapping;
          // REMOVED: flipY setting to maintain correct orientation
          frameMaterial.map = newTexture;
          frameMaterial.needsUpdate = true;
        };

        img.onerror = () => {
          console.warn(`Failed to load image for project: ${project.title}`);
          // Image already shows text fallback, no need to redraw
        };

        img.src = project.image;
      }

      // Position frame on wall with proper vertical centering
      frameMesh.position.set(position.x, position.y, position.z); // Use calculated vertical center
      frameMesh.rotation.y = position.rotation;

      // Add slight forward offset to prevent Z-fighting with walls
      const offsetDistance = 0.02; // Small offset to prevent coplanar surface flickering
      frameMesh.position.x += Math.cos(position.rotation) * offsetDistance;
      frameMesh.position.z += Math.sin(position.rotation) * offsetDistance;

      // Add a subtle glow effect - REDUCED: Less blue tint
      const glowGeometry = new THREE.PlaneGeometry(frameWidth + 0.5, frameHeight + 0.5);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a5568, // CHANGED: Neutral gray instead of blue to prevent color contamination
        transparent: true,
        opacity: 0.05, // REDUCED: Less opacity to minimize color interference
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(frameMesh.position);
      glowMesh.position.z -= 0.01; // Slightly behind the frame
      glowMesh.rotation.y = position.rotation;

      // Invisible interaction plane sized to the full artwork, so every visible pixel is clickable.
      const hitAreaGeometry = new THREE.PlaneGeometry(frameWidth, frameHeight);
      const hitAreaMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const hitAreaMesh = new THREE.Mesh(hitAreaGeometry, hitAreaMaterial);
      hitAreaMesh.position.copy(frameMesh.position);
      hitAreaMesh.rotation.y = position.rotation;
      hitAreaMesh.name = `portfolio-hit-area-${project.id}`;

      state.scene.add(glowMesh);
      state.scene.add(frameMesh);
      state.scene.add(hitAreaMesh);
      state.portfolioFrames.push({
        mesh: frameMesh,
        hitArea: hitAreaMesh,
        projectData: project,
      });
    };

    // OPTIMIZED: Minimal high-performance lighting setup
    const setupLighting = (): void => {
      if (!state.scene) return;

      const wallHeight = 12;

      // PERFORMANCE: Increased ambient light to compensate for fewer dynamic lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.44); // Increased by 20% (1.2 × 1.2)
      state.scene.add(ambientLight);

      // Central ceiling light (main illumination) - NO SHADOWS
      const centralLight = new THREE.PointLight(0xffffff, 3.0, 80); // Increased by 20% (2.5 × 1.2)
      centralLight.position.set(0, wallHeight - 1, 0);
      centralLight.castShadow = false; // DISABLED for performance
      state.scene.add(centralLight);

      // PERFORMANCE: Reduced from 8 to 4 ceiling lights (50% reduction)
      const lightCount = 4;
      for (let i = 0; i < lightCount; i++) {
        const angle = (i / lightCount) * Math.PI * 2;
        const x = Math.cos(angle) * 20;
        const z = Math.sin(angle) * 20;

        const ceilingLight = new THREE.PointLight(0xffffcc, 1.2, 40); // Increased by 20% (1.0 × 1.2)
        ceilingLight.position.set(x, wallHeight - 1, z);
        ceilingLight.castShadow = false; // NO SHADOWS for performance
        state.scene.add(ceilingLight);
      }

      // REMOVED: Accent spotlights (not needed with higher ambient)

      // Optimized lighting for the Thinker centerpiece
      setupThinkerLighting();

      console.log(
        "💡 OPTIMIZED: Scene lighting reduced from 11+ to 5 lights total (+20% brightness boost)",
      );
    };

    // OPTIMIZED: Reduced lighting for the Thinker statue
    const setupThinkerLighting = (): void => {
      if (!state.scene) return;

      // PERFORMANCE: Reduced from 8 lights to 2 (75% reduction)

      // Main dramatic spotlight from above-front (key light)
      const mainSpotlight = new THREE.SpotLight(0xffffff, 2.16); // Increased by 20% (1.8 × 1.2)
      mainSpotlight.position.set(0, 10, 8);
      mainSpotlight.angle = Math.PI / 3;
      mainSpotlight.penumbra = 0.4;
      mainSpotlight.distance = 30;
      mainSpotlight.castShadow = false; // DISABLED shadows for performance
      mainSpotlight.target.position.set(0, 2.5, 0);
      state.scene.add(mainSpotlight);
      state.scene.add(mainSpotlight.target);

      // Single laptop screen light for face illumination - NEUTRALIZED: Reduced blue tint
      const laptopScreenLight = new THREE.PointLight(0xaaccdd, 1.8, 15); // FIXED: Less blue, more neutral tone
      laptopScreenLight.position.set(0, 2.8, 1.0);
      state.scene.add(laptopScreenLight);

      // Call optimized invisible lighting (now only 2 lights)
      setupInvisibleThinkerLighting();

      console.log(
        "🎭 OPTIMIZED: Thinker lighting reduced to 4 total lights (from 15+, +20% brighter)",
      );
    };

    const keyboardListenerOptions: AddEventListenerOptions = { capture: true };

    /** Call synchronously from modal close (same user gesture) so pointer lock is allowed. */
    const resumeMuseumPointerLock = (): void => {
      const canvas = museumCanvas.value;
      if (!canvas) return;
      canvas.focus({ preventScroll: true });
      if (!state.isPointerLocked) {
        canvas.requestPointerLock();
      }
    };

    // Setup event listeners
    const setupEventListeners = (): void => {
      if (!museumContainer.value) return;

      // Pointer lock
      museumContainer.value.addEventListener("click", () => {
        if (!state.isPointerLocked) {
          museumCanvas.value?.requestPointerLock();
        }
      });

      // Pointer lock change events
      document.addEventListener("pointerlockchange", onPointerLockChange);
      document.addEventListener("pointerlockerror", () => {
        console.warn("Pointer lock failed");
      });

      // Capture phase so movement keys are handled before Firefox "find as you type" / Quick Find
      document.addEventListener("keydown", onKeyDown, keyboardListenerOptions);
      document.addEventListener("keyup", onKeyUp, keyboardListenerOptions);

      // Mouse controls for interaction
      document.addEventListener("click", onMouseClick);
      document.addEventListener("mousemove", onMouseMove);
    };

    /** Avoid stealing keys while typing in modals or museum settings inputs */
    const isKeyboardFocusInEditableField = (event: KeyboardEvent): boolean => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      return target.closest('[contenteditable="true"]') !== null;
    };

    const shouldCaptureMuseumMovementKeys = (event: KeyboardEvent): boolean => {
      if (props.modalOpen) return false;
      return !isKeyboardFocusInEditableField(event);
    };

    // Keyboard event handlers
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.code === "Escape" && state.isPointerLocked) {
        event.preventDefault();
        exitMuseum();
        return;
      }

      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          if (shouldCaptureMuseumMovementKeys(event)) {
            event.preventDefault();
            state.moveForward = true;
          }
          break;
        case "ArrowLeft":
        case "KeyA":
          if (shouldCaptureMuseumMovementKeys(event)) {
            event.preventDefault();
            state.moveLeft = true;
          }
          break;
        case "ArrowDown":
        case "KeyS":
          if (shouldCaptureMuseumMovementKeys(event)) {
            event.preventDefault();
            state.moveBackward = true;
          }
          break;
        case "ArrowRight":
        case "KeyD":
          if (shouldCaptureMuseumMovementKeys(event)) {
            event.preventDefault();
            state.moveRight = true;
          }
          break;
        case "Space":
          event.preventDefault(); // Prevent page scroll
          // Only jump on initial press, not while held down (prevents auto-repeat jumping)
          if (!state.inputState.spaceKeyHeld && state.physics.jumpsRemaining > 0) {
            state.inputState.spaceKeyHeld = true; // Mark space as being held
            initiateJump();
          } else if (state.inputState.spaceKeyHeld) {
            console.log("🚫 Space held down - release and press again to jump");
          }
          break;
        case "ShiftLeft":
        case "ShiftRight":
          if (!state.isRunning) {
            state.isRunning = true;
            state.targetSpeedMultiplier = 2.2;
          }
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent): void => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          state.moveForward = false;
          break;
        case "ArrowLeft":
        case "KeyA":
          state.moveLeft = false;
          break;
        case "ArrowDown":
        case "KeyS":
          state.moveBackward = false;
          break;
        case "ArrowRight":
        case "KeyD":
          state.moveRight = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          state.isRunning = false;
          state.targetSpeedMultiplier = 1.0;
          break;
        case "Space":
          // Release space key - allow jumping again on next press
          state.inputState.spaceKeyHeld = false;
          console.log("✅ Space key released - ready for next jump");
          break;
      }
    };

    // Handle project interaction - emit event instead of using game bridge
    const handleProjectInteraction = (projectId: string): void => {
      // Release pointer lock when opening a modal
      if (state.isPointerLocked) {
        document.exitPointerLock();
      }
      emit("project-selected", { projectId });
    };

    // Exit museum - emit event instead of using game bridge
    const exitMuseum = (): void => {
      if (state.isPointerLocked) {
        document.exitPointerLock();
      }
      emit("exit-museum");
    };

    // Jump mechanics
    const initiateJump = (): void => {
      if (state.physics.jumpsRemaining > 0) {
        // Increment jump count for this sequence
        state.physics.jumpCount++;

        // Second jump gets a slight boost for extra fun
        const jumpMultiplier = state.physics.jumpCount === 2 ? 1.1 : 1.0;

        // 🚀 JETPACK FIRING: Play sound effect ONLY on actual second jump
        // Note: Jetpack sound is independent of music setting (gameplay sound, not ambient)
        if (state.physics.jumpCount === 2) {
          playJetpackSound();
          state.physics.jetpackFired = true; // Mark that jetpack was used
          console.log("🚀 Jetpack fired! Double jump activated (jump #2 in sequence)");
        } else {
          console.log(`👟 Regular jump #${state.physics.jumpCount} - no jetpack`);
        }

        state.physics.velocityY = state.physics.jumpSpeed * jumpMultiplier;
        state.physics.jumpsRemaining--;
        state.physics.isGrounded = false;
      }
    };

    // Check boundary collision to prevent walking through walls, ceiling, and objects
    const checkBoundaryCollision = (
      currentPosition: THREE.Vector3,
      proposedMovement: THREE.Vector3,
    ): boolean => {
      const newPosition = currentPosition.clone().add(proposedMovement);

      // Museum dimensions (matching createMuseumEnvironment)
      const width = 60;
      const depth = 40;
      const wallHeight = 12;
      const buffer = 1.5; // Keep player away from walls

      // Check if new position would be outside boundaries
      const wallCollision =
        newPosition.x < -width / 2 + buffer ||
        newPosition.x > width / 2 - buffer ||
        newPosition.z < -depth / 2 + buffer ||
        newPosition.z > depth / 2 - buffer;

      // Note: Couch collision removed - now handled by raycaster for jumping/landing
      return wallCollision;
    };

    // Legacy collision function removed - now using raycaster for all furniture collision detection
    // Multiple furniture pieces are handled in the physics raycaster system

    // Check ceiling collision for vertical movement (jumping/gravity)
    const checkCeilingCollision = (currentY: number, proposedYMovement: number): boolean => {
      const newY = currentY + proposedYMovement;
      const wallHeight = 12;
      const ceilingHeight = wallHeight - 0.5; // Leave headroom

      return newY >= ceilingHeight;
    };

    // OPTIMIZED: Cache collision objects to avoid rebuilding every frame
    let cachedCollidableObjects: THREE.Object3D[] | null = null;
    let physicsRaycaster: THREE.Raycaster | null = null;

    const buildCollisionCache = (): void => {
      cachedCollidableObjects = [];

      // Add floor mesh
      if (state.floorMesh) {
        cachedCollidableObjects.push(state.floorMesh);
      }

      // Add all couch model meshes (pre-cached)
      state.couchModels.forEach((couchModel) => {
        couchModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.name = child.name || "couch-part";
            cachedCollidableObjects!.push(child);
          }
        });
      });

      // Add all bench model meshes (pre-cached)
      state.benchModels.forEach((benchModel) => {
        benchModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.name = child.name || "bench-part";
            cachedCollidableObjects!.push(child);
          }
        });
      });

      // Add thinker model meshes (pre-cached)
      if (state.thinkerModel) {
        state.thinkerModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.name = child.name || "thinker-part";
            cachedCollidableObjects!.push(child);
          }
        });
      }

      // Add other models (pre-cached)
      const models = [
        state.socratesModel,
        state.starbucksModel,
        state.cleoModel,
        state.mouseManModel,
      ];
      models.forEach((model, index) => {
        if (model) {
          model.traverse((child: any) => {
            if (child instanceof THREE.Mesh) {
              child.name = child.name || `model-${index}-part`;
              cachedCollidableObjects!.push(child);
            }
          });
        }
      });
    };

    // Enhanced physics with OPTIMIZED raycaster surface detection
    const updatePhysics = (delta: number): void => {
      if (!state.camera || !state.yawObject || !state.scene) return;

      // Initialize raycaster once (reuse same instance)
      if (!physicsRaycaster) {
        physicsRaycaster = new THREE.Raycaster();
      }

      // Build collision cache once after all models are loaded
      if (!cachedCollidableObjects) {
        buildCollisionCache();
      }

      const playerPosition = state.yawObject.position;

      // Cast ray downward from player
      physicsRaycaster.set(playerPosition, new THREE.Vector3(0, -1, 0));

      // Perform intersection test with cached objects
      const intersections = physicsRaycaster.intersectObjects(cachedCollidableObjects!, false);

      let targetGroundLevel = 0; // Default floor level
      let landedOnSurface = null;

      if (intersections.length > 0) {
        // Get the highest surface below the player
        const validIntersections = intersections.filter(
          (intersection) => intersection.point.y <= playerPosition.y,
        );

        if (validIntersections.length > 0) {
          const closestIntersection = validIntersections[0];
          targetGroundLevel = closestIntersection.point.y;
          landedOnSurface = closestIntersection.object.name || "unknown surface";
        }
      }

      const distanceToGround = playerPosition.y - targetGroundLevel;
      const playerGroundHeight = state.physics.groundHeight;

      // Apply gravity if not grounded or falling
      if (!state.physics.isGrounded || state.physics.velocityY < 0) {
        state.physics.velocityY -= state.physics.gravity * delta;
        const proposedYMovement = state.physics.velocityY * delta;

        // Check ceiling collision before applying vertical movement
        if (!checkCeilingCollision(state.yawObject.position.y, proposedYMovement)) {
          state.yawObject.position.y += proposedYMovement;
        } else {
          // Hit ceiling - apply bounce-back effect
          const wallHeight = 12;
          const ceilingHeight = wallHeight - 0.5;
          state.yawObject.position.y = ceilingHeight;
          state.physics.velocityY = -Math.abs(state.physics.velocityY) * 0.1;
        }
      }

      // Enhanced ground/surface collision detection
      if (state.physics.velocityY <= 0 && distanceToGround <= playerGroundHeight + 0.1) {
        // Land on the detected surface
        state.yawObject.position.y = targetGroundLevel + playerGroundHeight;
        state.physics.velocityY = 0;

        // Check if we need to stop jetpack sound before setting grounded
        if (!state.physics.isGrounded && state.physics.jetpackFired) {
          stopJetpackSound();
          state.physics.jetpackFired = false; // Reset jetpack flag
        }

        state.physics.isGrounded = true;
        state.physics.jumpsRemaining = state.physics.maxJumps; // Reset jumps when landing
        state.physics.jumpCount = 0; // Reset jump sequence counter when landing
        // Reset input state when landing (in case space is still held)
        state.inputState.spaceKeyHeld = false;

        // Optional: Log what surface we landed on (great for debugging!)
        if (landedOnSurface && landedOnSurface !== "floor") {
          console.log(`🎯 Landed on: ${landedOnSurface} at height ${targetGroundLevel.toFixed(2)}`);
        }
        console.log("🏃 Landed - jump sequence reset");
      } else if (distanceToGround > playerGroundHeight + 0.1) {
        // Player is in the air
        state.physics.isGrounded = false;
      }

      // MANDATORY ceiling collision enforcement
      const wallHeight = 12;
      const ceilingHeight = wallHeight - 0.5;
      if (state.yawObject.position.y > ceilingHeight) {
        state.yawObject.position.y = ceilingHeight;
        state.physics.velocityY = Math.min(state.physics.velocityY, 0);
      }
    };

    // Performance monitoring system
    let lastTime = 0;
    let frameCount = 0;
    let fps = 0;

    const updatePerformanceStats = (): void => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        // Update every second
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;

        // Log performance stats for debugging
        if (fps < 30) {
          console.warn(`🔴 LOW FPS WARNING: ${fps} FPS - Performance issues detected`);
        } else if (fps < 50) {
          console.log(`🟡 Moderate FPS: ${fps} FPS - Acceptable performance`);
        } else {
          console.log(`🟢 Good FPS: ${fps} FPS - Smooth performance`);
        }
      }
    };

    // Animation loop
    const animate = (): void => {
      if (!state.scene || !state.camera || !state.renderer || !state.clock || !state.yawObject)
        return;

      requestAnimationFrame(animate);

      const delta = state.clock.getDelta();

      // Update physics (gravity and jumping)
      updatePhysics(delta);

      // Update running speed transition
      state.currentSpeedMultiplier = THREE.MathUtils.lerp(
        state.currentSpeedMultiplier,
        state.targetSpeedMultiplier,
        state.speedTransitionRate * delta,
      );

      // Handle horizontal movement
      state.velocity.x -= state.velocity.x * 10.0 * delta;
      state.velocity.z -= state.velocity.z * 10.0 * delta;

      const speed = 24.0 * state.currentSpeedMultiplier;
      if (state.moveForward) state.velocity.z -= speed * delta;
      if (state.moveBackward) state.velocity.z += speed * delta;
      if (state.moveLeft) state.velocity.x -= speed * delta;
      if (state.moveRight) state.velocity.x += speed * delta;

      // Apply movement using the yaw object's local directions with collision detection
      const direction = new THREE.Vector3();
      direction.x = state.velocity.x * delta;
      direction.z = state.velocity.z * delta;
      direction.applyQuaternion(state.yawObject.quaternion);

      // Check collision before applying movement
      if (!checkBoundaryCollision(state.yawObject.position, direction)) {
        state.yawObject.position.add(direction);
      }

      state.renderer.render(state.scene, state.camera);

      // Update performance monitoring
      updatePerformanceStats();
    };

    // Proximity detection removed - users click directly to interact

    // Handle window resize
    const handleResize = (): void => {
      if (!state.camera || !state.renderer || !museumContainer.value) return;

      state.camera.aspect = museumContainer.value.clientWidth / museumContainer.value.clientHeight;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(museumContainer.value.clientWidth, museumContainer.value.clientHeight);
    };

    // Cleanup
    const cleanup = (): void => {
      document.removeEventListener("keydown", onKeyDown, keyboardListenerOptions);
      document.removeEventListener("keyup", onKeyUp, keyboardListenerOptions);
      document.removeEventListener("click", onMouseClick);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);

      // Stop background music
      stopBackgroundMusic();

      // Clean up jetpack sound
      if (state.jetpackSound) {
        state.jetpackSound.pause();
        state.jetpackSound = null;
      }

      // Reset input state
      state.inputState.spaceKeyHeld = false;

      // Dispose of 3D models
      state.couchModels.forEach((couchModel) => {
        couchModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        if (state.scene) {
          state.scene.remove(couchModel);
        }
      });
      state.couchModels = [];

      // Dispose of bench models
      state.benchModels.forEach((benchModel) => {
        benchModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        if (state.scene) {
          state.scene.remove(benchModel);
        }
      });
      state.benchModels = [];

      // Dispose of thinker model
      if (state.thinkerModel) {
        state.thinkerModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        if (state.scene) {
          state.scene.remove(state.thinkerModel);
        }
        state.thinkerModel = null;
      }

      // Dispose of mouse man model
      if (state.mouseManModel) {
        state.mouseManModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        if (state.scene) {
          state.scene.remove(state.mouseManModel);
        }
        state.mouseManModel = null;
      }

      // Dispose of Cleo model
      if (state.cleoModel) {
        state.cleoModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        if (state.scene) {
          state.scene.remove(state.cleoModel);
        }
        state.cleoModel = null;
      }

      // Dispose of Socrates model
      if (state.socratesModel) {
        state.socratesModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        if (state.scene) {
          state.scene.remove(state.socratesModel);
        }
        state.socratesModel = null;
      }

      // Dispose of Starbucks model
      if (state.starbucksModel) {
        state.starbucksModel.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        if (state.scene) {
          state.scene.remove(state.starbucksModel);
        }
        state.starbucksModel = null;
      }

      // Dispose of floor mesh
      if (state.floorMesh) {
        if (state.floorMesh.geometry) state.floorMesh.geometry.dispose();
        if (state.floorMesh.material) {
          if (Array.isArray(state.floorMesh.material)) {
            state.floorMesh.material.forEach((material) => material.dispose());
          } else {
            state.floorMesh.material.dispose();
          }
        }
        if (state.scene) {
          state.scene.remove(state.floorMesh);
        }
        state.floorMesh = null;
      }

      if (state.renderer) {
        state.renderer.dispose();
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      initializeMuseum();
      window.addEventListener("resize", handleResize);
    });

    onUnmounted(() => {
      cleanup();
    });

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
      saveSettings,
      exitMuseum,
      resumeMuseumPointerLock,
    };
  },
});
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

.museum-back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 20;
  pointer-events: auto;
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

.museum-back-button:hover {
  background: rgba(52, 152, 219, 0.9);
  transform: translateY(-2px);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
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
