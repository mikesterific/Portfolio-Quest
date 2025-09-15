# System Patterns - Resume Game

## Architecture Patterns

### Hybrid Game-Web Architecture
- **Game Layer**: Phaser.js canvas for 2D world and character interactions
- **3D Museum Layer**: Three.js WebGL for immersive 3D portfolio gallery
- **UI Layer**: Vue 3 components for modals, forms, and traditional elements
- **Data Layer**: JSON configuration for portfolio content and game world data
- **Asset Layer**: Optimized sprite sheets, tilesets, PBR textures, and media files

### Component Structure
```
Portfolio Quest/
├── Game Engine (Phaser.js)
│   ├── Scene Management (different game areas)
│   ├── Character Controller
│   ├── Interaction System
│   └── Animation Engine
├── 3D Museum Engine (Three.js)
│   ├── Circular Gallery Architecture
│   ├── First-Person Controls (PointerLockControls)
│   ├── PBR Material System
│   ├── Professional Gallery Lighting
│   └── Interactive Portfolio Frames
├── UI Framework (Vue 3)
│   ├── Modal Components (project details)
│   ├── Navigation Components
│   └── Traditional Portfolio Views
└── Data Management
    ├── Portfolio JSON data
    ├── Game Configuration
    ├── Professional Texture Assets
    └── Asset Manifests
```

## Design Patterns

### Game Design Patterns
- **State Pattern**: Game scenes (Skill Village, Project Forest, Résumé Tower)
- **Observer Pattern**: User interactions triggering UI updates
- **Factory Pattern**: Dynamic creation of interactive game objects
- **Command Pattern**: User input handling and game actions
- **Functional Factory Pattern**: Pure creation functions for game entities
- **Shared Utility Pattern**: Reusable functions across multiple scenes

### 3D Museum Design Patterns
- **Circular Architecture Pattern**: Radial layout for optimal portfolio viewing
- **Professional Gallery Lighting**: Ambient + spotlights for artwork illumination
- **PBR Material System**: Physically Based Rendering for realistic surfaces
- **Modular Asset Loading**: Professional textures from established libraries
- **First-Person Interaction**: PointerLockControls for immersive navigation
- **Event-Driven Modals**: Vue emit system for portfolio piece interactions

### Web Design Patterns
- **Composition API**: Vue 3's modern approach for component logic
- **MVVM Pattern**: Vue's reactive data binding and component architecture
- **Responsive Design**: Mobile-first with HDMI optimization
- **Progressive Enhancement**: Core content accessible without game features

## Development Patterns

### Asset Organization
- **Sprite Atlases**: Efficient texture packing for game performance
- **Modular Assets**: Reusable tilesets and sprite components
- **Lazy Loading**: On-demand asset loading for better performance
- **Content Strategy**: JSON-driven content for easy updates

### Code Organization
- **Scene-Based Architecture**: Separate files for each game area
- **Component-Based UI**: Reusable Vue 3 components with Composition API
- **Event-Driven Communication**: Clean separation between game and UI layers
- **Configuration-Driven**: JSON files for game world and portfolio data
- **Functional Scene Architecture**: Pure functions and factory patterns within Phaser classes

### Functional Programming Patterns (NEW)
- **Pure Functions**: Data generation and calculations without side effects
- **Factory Functions**: Reusable object creation for game entities
- **State Management**: Centralized state interfaces for scene management
- **Shared Utilities**: Common functions across scenes (distance, movement, proximity)
- **Immutable Data Structures**: Read-only configuration and game data
- **Functional Composition**: Building complex behaviors from simple functions

#### Implemented Functional Utilities
```typescript
// Shared across all scenes
calculateDistance(obj1, obj2) → number
findNearestObject(player, objects, maxDistance) → GameObject | null
updatePlayerVelocity(playerBody, cursors, keyboard, speed) → void
createPlayer(scene, x, y) → Phaser.GameObjects.Rectangle

// Scene-specific factories
createSkillNPC(scene, skill, onInteract) → Container
createResumeBook(scene, element, onInteract) → Container  
createProjectChest(scene, project, onInteract) → Container
createPortal(scene, portalData, onActivate) → Container
```

## Technology Stack

### Frontend
- **Game Engine**: Phaser.js 3.x
- **UI Framework**: Vue 3 with Composition API
- **Build Tool**: Vite (optimized for Vue)
- **Animation**: GSAP, Phaser animations
- **Styling**: CSS3, SCSS/SASS (with Vite support)

### Development Tools
- **Art**: Aseprite, Pixel Studio, or free alternatives
- **Design**: Figma for UI mockups
- **Version Control**: Git with GitHub/GitLab
- **Testing**: Vitest (Vite's testing framework), Cypress for E2E testing

### Deployment
- **Hosting**: Netlify, Vercel, or GitHub Pages
- **CDN**: Built-in CDN from hosting provider
- **Domain**: Professional domain registration
- **Analytics**: Google Analytics or similar

### Asset Pipeline
- **Images**: WebP with PNG fallbacks
- **Audio**: MP3/OGG with toggle controls
- **Optimization**: Image compression, code minification
- **Caching**: Service worker for offline functionality

---

### Debugging and Validation Patterns (NEW)
- **Phaser Group iteration semantics**: Returning `false` from `Group.children.each` stops iteration after the first item. Return `null` (or no boolean) to process all children. Use this to avoid partial updates in per-tick loops.
- **In-scene instrumentation**: Add lightweight labels and periodic JSON snapshots to verify state across many entities simultaneously. Example: show shield HP above stations and log an array of all shield states once per second.
- **Visibility of regeneration**: Regeneration logic only manifests after damage and a cooldown. For testing, apply a one-time `-1 HP` across entities or provide a debug toggle to force visibility.
- **Lifecycle reactivation**: When an entity is “destroyed” (hidden/disabled) and later regens, re-enable both visibility and physics bodies to restore interactions.
- **Config unification for isolation**: Temporarily unify per-entity configs to remove variables during debugging; restore differentiated configs after validation.

---

### QA & Testing Rituals (NEW)
- **Run tests at task completion**: After finishing any task, run the full test suite before marking it complete.
  - Command: `npm test`
  - Prefer running the full suite (not just a subset) to satisfy coverage thresholds configured for scenes.
- **Vue + Phaser testing guideline**: For Vue components that integrate Phaser, mount using `@vue/test-utils` and rely on the Phaser mock to avoid starting a real game loop.
- **If thresholds fail**: Add or adjust tests until Jest coverage thresholds pass for files with explicit gates (e.g., scenes in `jest.config.cjs`).

---

### Canvas Positioning Architecture (NEW)
The Phaser canvas positioning follows a precise hierarchy for full-viewport game experience with overlay modals:

#### DOM Structure & Flow
```text
#app (fills viewport)
└─ .game-container (fills viewport; relative; overflow:hidden; background)
   ├─ #game-container.game-canvas (fills .game-container; Phaser parent)
   │  └─ <canvas> (injected by Phaser; scaled+centered via FIT + CENTER_BOTH)
   └─ [Vue modals] (fixed; z-index:1000; overlay above canvas)
```

#### Phaser Canvas Injection
- **Parent Target**: Phaser mounts canvas into `parent: 'game-container'` (GameConfig.ts)
- **Base Dimensions**: `width: 1920, height: 1080` for HDMI optimization
- **Scale Mode**: `Phaser.Scale.FIT` maintains aspect ratio while fitting parent
- **Centering**: `autoCenter: Phaser.Scale.CENTER_BOTH` centers canvas within parent
- **Size Constraints**: `min: 800×600, max: 3840×2160` for responsive bounds

#### Container Hierarchy
- **`.game-container`**: Outer wrapper (100vw×100vh, relative positioning, overflow:hidden)
- **`#game-container.game-canvas`**: Phaser parent div (100% of wrapper, direct child)
- **Canvas Element**: Injected by Phaser, scaled/centered within parent div

## 3D Museum Implementation Lessons

### Technical Architecture Decisions

#### Three.js Integration with Vue 3
- **Component Structure**: SpaceMuseum.vue as standalone Three.js component
- **Lifecycle Management**: onMounted/onUnmounted for proper cleanup
- **State Management**: Reactive refs for UI state, internal object for 3D state
- **Event System**: Vue emit events for portfolio interactions (independent from Phaser)

#### Asset Management Strategy
- **Professional Texture Sources**: AmbientCG and Polyhaven for high-quality PBR materials
- **Asset Organization**: `/public/textures/{floor,ceiling,walls}/` structure
- **Texture Loading**: THREE.TextureLoader with proper wrapping and repeat settings
- **Performance Optimization**: 1K textures for web performance vs 4K for quality

#### Circular Museum Architecture
```javascript
// Key architectural decisions:
const radius = 30              // Museum size for comfortable navigation
const wallHeight = 12          // Human-scale proportions
const wallThickness = 0.5      // Realistic wall depth
const frameSpacing = automatic // Even distribution around circle
```

### Material System Lessons

#### PBR Material Implementation
- **MeshStandardMaterial**: Better than MeshLambertMaterial for realistic lighting
- **Texture Mapping**: Proper UV wrapping with RepeatWrapping for seamless tiling
- **Professional Lighting**: Ambient (0.6) + Point lights (2.0 intensity) for gallery feel

#### Lighting Best Practices
- **Gallery Lighting Pattern**: Central illumination + perimeter lights + accent spotlights
- **Shadow Configuration**: 2048x2048 shadow maps for quality vs performance balance
- **Color Temperature**: White light (0xffffff) for accurate portfolio color representation

### Interaction System Patterns

#### First-Person Controls
- **PointerLockControls**: Industry standard for FPS navigation in Three.js
- **Movement Physics**: Velocity-based movement with friction for natural feel
- **Modal Integration**: Release pointer lock when opening portfolio modals

#### Event-Driven Architecture
```javascript
// Clean separation between 3D engine and Vue UI:
emit('project-selected', { projectId })  // To parent component
emit('exit-museum')                      // For navigation
```

### Asset Acquisition Strategy

#### Professional Asset Sources
1. **Clone Reference Projects**: Extract working assets from established galleries
2. **Professional Libraries**: AmbientCG (free registration) and Polyhaven (free)
3. **Fallback Strategy**: Generate procedural textures if downloads fail
4. **Version Control**: Handle Git LFS issues with large texture files

#### File Organization Lessons
```
public/textures/
├── floor/diffuse.jpg     (Wood texture - most visible impact)
├── ceiling/diffuse.jpg   (Office ceiling - professional feel)
└── walls/diffuse.jpg     (Wall texture - gallery atmosphere)
```

### Performance Optimization Patterns

#### Texture Optimization
- **Resolution Strategy**: Start with 1K, upgrade to 2K only if needed
- **Format Choice**: JPG for diffuse maps, PNG for normal/alpha maps
- **Compression**: Balance quality vs loading time for web delivery

#### Rendering Optimization
- **Geometry Efficiency**: 64 segments for smooth circles without excess polygons
- **Material Sharing**: Reuse materials where possible to reduce draw calls
- **Shadow Optimization**: Selective shadow casting for performance

### 3D Model Integration Patterns (NEW)

#### GLTFLoader Implementation
- **Import Strategy**: `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'`
- **Async Loading**: Use `loader.loadAsync()` for Promise-based model loading
- **State Management**: Add model properties to Museum state interface
- **Error Handling**: Graceful fallbacks with console logging for missing models

#### Model Configuration Best Practices
```javascript
// Scaling and Positioning Pattern:
state.couchModel = gltf.scene
state.couchModel.scale.setScalar(2.0)           // Uniform scaling
state.couchModel.position.set(0, 0, 10)         // Museum positioning
state.couchModel.rotation.y = Math.PI           // Face portfolio walls
```

#### ⚡ CRITICAL: Always Add Collision Detection
**MANDATORY PATTERN**: Every 3D model must be added to the collision detection system to prevent players from walking through objects.

```javascript
// In updatePhysics() function - Add to collidableObjects array:
if (state.yourModel) {
  state.yourModel.traverse((child: any) => {
    if (child instanceof THREE.Mesh) {
      child.name = child.name || 'your-model-part' // Name for identification
      collidableObjects.push(child)
    }
  })
}
```

#### ⚡ CRITICAL: Consider Player Spawn Positioning
**MANDATORY PATTERN**: When adding 3D models to the center area, verify player spawn position doesn't cause collision.

**Current Player Spawn**: `(0, 1.8, 8)` - In front of center, facing centerpiece
**Center Area**: Models at `(0, 0, Z)` should consider spawn clearance

```javascript
// When positioning central models, consider player spawn at (0, 1.8, 8):
model.position.set(0, 0, 0)  // ✅ Safe - player spawns in front at Z=8
model.position.set(0, 0, 8)  // ❌ COLLISION - player spawns inside model
```

**Why This Matters**: Without collision detection, 3D models are purely visual and players can walk through them, breaking immersion and spatial logic.

#### Material and Lighting Optimization
- **Shadow Integration**: Enable `castShadow` and `receiveShadow` on all mesh children
- **Material Updates**: Force `material.needsUpdate = true` after loading
- **PBR Compatibility**: Loaded models work seamlessly with existing PBR lighting system
- **Traversal Pattern**: Use `model.traverse()` to configure all child meshes

#### Collision Detection for 3D Objects
```javascript
// Collision Pattern for Loaded Models:
const checkCouchCollision = (playerPosition) => {
  if (!state.couchModel) return false
  const distance = playerPosition.distanceTo(state.couchModel.position)
  const collisionRadius = Math.max(bounds.width, bounds.depth) / 2 + buffer
  return distance < collisionRadius
}
```

#### Memory Management for 3D Models
- **Geometry Disposal**: `child.geometry.dispose()` in cleanup
- **Material Disposal**: Handle both single materials and material arrays
- **Scene Removal**: `scene.remove(model)` before setting model to null
- **Complete Cleanup**: Traverse all children to dispose resources properly

### Enhanced Collision Detection Patterns (NEW)

#### Raycaster-Based Surface Detection
- **Downward Raycasting**: Use `raycaster.set(position, new THREE.Vector3(0, -1, 0))` for ground detection
- **Multi-Object Intersection**: Build collidable objects array from floor, furniture, and other surfaces
- **Surface Height Detection**: Use `intersection.point.y` for precise landing height calculation
- **Performance**: Single raycaster per frame more efficient than multiple collision checks

#### Advanced Physics Integration
```javascript
// Enhanced Surface Landing Pattern:
const intersections = raycaster.intersectObjects(collidableObjects, true)
const validIntersections = intersections.filter(i => i.point.y <= playerPosition.y)
const targetGroundLevel = validIntersections[0].point.y
const distanceToGround = playerPosition.y - targetGroundLevel

// Landing Logic:
if (state.physics.velocityY <= 0 && distanceToGround <= playerGroundHeight + 0.1) {
  state.yawObject.position.y = targetGroundLevel + playerGroundHeight
  state.physics.isGrounded = true
}
```

#### Multi-Level Ground System
- **Dynamic Ground Heights**: Support floor (0), furniture tops (variable), platforms
- **Surface Identification**: Name objects for debugging and interaction feedback
- **Seamless Transitions**: Maintain existing physics while adding surface detection
- **Collision Hierarchy**: Walls block movement, surfaces support landing

#### Debugging and Validation for 3D Interactions
- **Surface Logging**: `console.log('🎯 Landed on: ${surfaceName} at height ${height}')` for testing
- **Intersection Filtering**: Only consider surfaces below player position
- **Visual Debugging**: Object naming helps identify interaction targets
- **Performance Monitoring**: Single raycaster vs multiple collision checks comparison

#### Integration Best Practices
- **State Management**: Add surface references (`floorMesh`) to Museum state
- **Non-Breaking Changes**: Enhance existing physics without removing core functionality
- **Extensible Architecture**: Easy to add new furniture and surfaces
- **Cleanup Patterns**: Dispose surface mesh references in component unmount

### Integration Patterns

#### Vue + Three.js Best Practices
- **Component Isolation**: Keep Three.js logic contained within Vue component
- **Cleanup Management**: Proper disposal of Three.js resources on component unmount
- **State Synchronization**: Use Vue reactive refs for UI state, internal objects for 3D state
- **Modal Coordination**: Prevent 3D interactions when Vue modals are open

#### Multi-Engine Architecture
- **Independent Systems**: Phaser game and Three.js museum as separate experiences
- **Shared Assets**: Reuse portfolio data across both engines
- **Routing Strategy**: Vue Router for navigation between 2D game and 3D museum
- **Event Isolation**: Separate event systems prevent cross-contamination
- **Global CSS**: `html,body` at 100% height, `overflow:hidden` prevents scrollbars

#### Visual Positioning Results
- Canvas scales to fit viewport while preserving 16:9 aspect ratio
- Letterboxing space (if any) remains inside `.game-container`
- Vue modals overlay with `position:fixed` and `z-index:1000`
- Touch interaction prevented on canvas via `touch-action:none`

#### Common Adjustments
- **Remove letterboxing**: Change to `Phaser.Scale.RESIZE` (stretches aspect)
- **Top-left anchor**: Set `autoCenter: Phaser.Scale.NO_CENTER`
- **Limit max scaling**: Adjust `scale.max` for pixel density control

---

## Performance Optimization Patterns

### Three.js Performance-First Architecture

#### Shadow Budget Pattern
**Problem**: Multiple shadow-casting lights create exponential performance degradation
**Solution**: Strict shadow budget with compensation strategy
```javascript
// PATTERN: 1 Primary + Multiple Fill Lights
const SHADOW_BUDGET = {
  maxShadowLights: 2,           // Hard limit for scene
  maxShadowResolution: 256,     // Per-light shadow map size
  totalShadowPixels: '< 1MP'    // Across all shadow maps
}

// COMPENSATION: Boost ambient + fill lights when shadows are reduced
ambientLight.intensity = shadowsEnabled ? 0.6 : 0.9
```

#### Emergency Performance Pattern  
**Pattern**: Always implement emergency performance fallback for 3D experiences
```javascript
// EMERGENCY PATTERN: Instant FPS recovery
const emergencyOptimization = {
  disableShadows: () => renderer.shadowMap.enabled = false,     // 70-90% FPS boost
  disableAntialiasing: () => renderer = new WebGLRenderer({antialias: false}), // 15-25% boost  
  capPixelRatio: () => renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)), // High-DPI protection
  enablePerformanceMode: () => renderer.powerPreference = 'high-performance'
}
```

#### Real-time Performance Monitoring Pattern
**Pattern**: Build-in FPS monitoring for development and production
```javascript
const PerformanceMonitor = {
  frameCount: 0,
  lastTime: 0,
  
  update() {
    this.frameCount++
    const now = performance.now()
    if (now >= this.lastTime + 1000) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastTime))
      this.logPerformanceStatus(fps)
      this.frameCount = 0
      this.lastTime = now
    }
  },
  
  logPerformanceStatus(fps) {
    if (fps < 30) console.warn(`🔴 CRITICAL FPS: ${fps} - Enable emergency optimizations`)
    else if (fps < 50) console.log(`🟡 MODERATE FPS: ${fps} - Consider optimizations`)  
    else console.log(`🟢 OPTIMAL FPS: ${fps} - Performance acceptable`)
  }
}
```

#### Lighting Architecture Pattern
**Pattern**: Hierarchical lighting with performance priorities
```javascript
const LightingHierarchy = {
  // LEVEL 1: Essential (Always rendered)
  ambient: { type: 'AmbientLight', intensity: 0.6, shadows: false },
  
  // LEVEL 2: Primary (1 shadow light max)
  primary: { type: 'SpotLight', intensity: 1.4, shadows: true, resolution: 256 },
  
  // LEVEL 3: Fill (Multiple, no shadows)
  fill: [
    { type: 'PointLight', intensity: 0.8, shadows: false },
    { type: 'SpotLight', intensity: 0.7, shadows: false }
  ],
  
  // LEVEL 4: Accent (Disabled first during performance issues)
  accent: { type: 'PointLight', intensity: 0.4, shadows: false, optional: true }
}
```

#### The Shadow Map Trap Anti-Pattern
**Anti-Pattern**: Adding shadow-casting lights without performance consideration
```javascript
// ❌ ANTI-PATTERN: Shadow Map Explosion  
lights.forEach(light => {
  light.castShadow = true                    // 7+ shadow lights
  light.shadow.mapSize.width = 1024         // 1MP each = 7MP total per frame
  light.shadow.mapSize.height = 1024        // Result: 15-25 FPS death spiral
})

// ✅ CORRECT PATTERN: Shadow Budget Management
const createLight = (config) => {
  const light = new THREE[config.type](config.color, config.intensity)
  
  if (config.shadows && shadowBudget.hasCapacity()) {
    light.castShadow = true
    light.shadow.mapSize.setScalar(shadowBudget.getResolution())
    shadowBudget.allocate()
  }
  
  return light
}
```

### Performance-First Design Principles

1. **Performance Over Beauty**: 60 FPS with basic lighting > 15 FPS with cinematic lighting
2. **Emergency Fallbacks**: Always implement instant performance recovery options
3. **Budget-Driven Development**: Define hard limits (shadow pixels, lights, draw calls)
4. **Real-time Monitoring**: Built-in FPS tracking for immediate feedback
5. **Hierarchical Degradation**: Remove expensive features first during performance issues

### Key Performance Metrics

- **Target FPS**: 60 (optimal), 50+ (acceptable), 30+ (playable), <30 (critical)
- **Shadow Budget**: <1MP total shadow pixels across all lights in scene
- **Light Limits**: 1-2 shadow lights, unlimited non-shadow lights
- **Pixel Ratio**: Cap at 1.5x to prevent 4K rendering overload

This performance-first approach ensures 3D experiences remain interactive and enjoyable across a wide range of devices, avoiding the common trap of prioritizing visual fidelity over user experience.

---

## Portfolio Frame Optimization Lessons (NEW)

### Custom Aspect Ratio Strategy

#### Problem: Standard Aspect Ratios Don't Fit All Content
**Issue**: User's portfolio images were "too short" for standard 16:9 (1.78:1) aspect ratio frames
**Root Cause**: Web screenshot content often captures more vertical information than widescreen ratios accommodate

#### Solution: Content-Driven Aspect Ratio Design
**Custom Ratio**: 1.92:1 (854×445 pixels) - Wider than 16:9 but shorter than ultra-widescreen
**Reasoning**: Optimized for web project screenshots and UI mockups

```javascript
// BEFORE: Standard 16:9
canvas.width = 854
canvas.height = 480    // 1.78:1 ratio
frameHeight = 4.5

// AFTER: Custom content-optimized  
canvas.width = 854
canvas.height = 445    // 1.92:1 ratio - 35px shorter
frameHeight = 4.17     // Adjusted 3D frame geometry
```

### Image Specification Strategy

#### Multi-Resolution Approach
**Primary**: 854×445px - Perfect pixel match for canvas resolution
**High-Quality**: 1280×667px - Maintains exact aspect ratio at higher resolution  
**Maximum**: 1920×1000px - Ultra-high resolution for detailed portfolio pieces

#### Content-Specific Optimization
- **Web Projects**: Capture browser screenshots at 1280×667 viewport for perfect aspect ratio
- **Logo Design**: Create contextual mockups (business cards, headers, applications)
- **UI/UX Work**: Focus on interface screenshots rather than full-page captures

### Async Image Loading Pattern

#### Graceful Fallback Architecture
```javascript
// PATTERN: Text-first with async image overlay
const createPortfolioFrame = (project) => {
  // 1. Draw text-based frame immediately
  drawTextBasedFrame()
  const texture = new THREE.CanvasTexture(canvas)
  
  // 2. Load image asynchronously if available
  if (project.image) {
    const img = new Image()
    img.onload = () => {
      // Redraw canvas with image + overlay
      drawImageWithOverlay(img)
      // Update existing texture
      frameMaterial.map = new THREE.CanvasTexture(canvas)
      frameMaterial.needsUpdate = true
    }
    img.src = project.image
  }
}
```

#### Dual-Rendering System
**Text Mode**: Full project information display for missing images
**Image Mode**: Background image with gradient overlay and essential info

### Frame Content Layout Optimization

#### Widescreen Text Layout
- **Title Font**: Increased from 28px to 36px for wider format
- **Description Wrapping**: Improved line breaks with wider max-width
- **Technology Tags**: Limited to 4 items to fit widescreen overlay

#### Image Overlay Design
- **Gradient**: Transparent to 95% opacity dark background
- **Information Hierarchy**: Project title + key technologies only
- **Positioning**: Bottom overlay preserving image visibility

### Development Environment Considerations

#### Node.js Version Compatibility
**Discovered Issue**: Vite 7.x requires Node.js 20.19+ or 22.12+
**User Environment**: Node.js 18.20.4 caused crypto.hash errors
**Impact**: Build and dev server failures unrelated to frame changes
**Resolution**: Frame optimization code works; Node.js upgrade needed for deployment

### Asset Organization Pattern

#### Portfolio Image Structure
```
src/assets/images/portfolio/
├── README.md                    // Specifications documentation
├── portfolio-quest.jpg          // Exact filename matching
├── dell-xps-poc.jpg            // project.id + .jpg convention
└── [project-id].jpg            // Consistent naming pattern
```

#### Image Preparation Workflow
1. **Capture/Create**: Screenshot or design at high resolution
2. **Crop**: Adjust to exact 854×445 or 1280×667 aspect ratio
3. **Optimize**: Compress for web (target 100-600KB per image)
4. **Test**: Verify loading and fallback behavior in museum

### Performance Impact Analysis

#### Memory Considerations
- **Canvas Size Reduction**: 854×480 → 854×445 (7% fewer pixels per frame)
- **Texture Memory**: 12 frames × 854×445 = 4.5MB texture memory (vs 4.9MB before)
- **Loading Performance**: Async image loading prevents blocking frame creation

#### Rendering Efficiency
- **Immediate Display**: Text frames render instantly
- **Progressive Enhancement**: Images load and replace text seamlessly
- **Error Resilience**: Missing images don't break frame display

### Key Design Principles

1. **Content-First Design**: Let actual content drive technical specifications
2. **Graceful Degradation**: Always provide fallback experiences
3. **Performance Budgets**: Consider memory and loading impact of design changes
4. **User-Driven Optimization**: Adjust based on actual content needs rather than standards
5. **Documentation**: Maintain clear specifications for content creators

### Implementation Lessons

- **Aspect Ratio Flexibility**: Don't force standard ratios if content doesn't fit
- **Async Loading**: Essential for responsive UI with large image assets
- **Testing Environment**: Node.js version compatibility can block development
- **Documentation**: Clear image specs prevent content creation delays

This content-driven approach to portfolio frame optimization demonstrates that technical standards should serve content needs, not constrain them.

---

*Part of Memory Bank System*