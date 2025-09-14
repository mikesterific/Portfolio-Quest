# Technical Context - Portfolio Quest

## Development Environment

### Node.js Version Requirement
- **Required**: Node.js v20+ (for Vite compatibility)
- **Issue**: Node.js v18 causes `crypto.hash is not a function` error with Vite
- **Solution**: Use nvm to switch to Node v20

```bash
# Switch to Node.js v20 (if available)
nvm use 20.19.1

# Or install and use latest v20 if not available
nvm install 20
nvm use 20

# Set as default (optional)
nvm alias default 20
```

### Development Server
```bash
# After switching to Node v20
npm run dev
```

## Core Technologies

### 3D Graphics Engine
- **Three.js**: WebGL-based 3D graphics library for the space museum
  - **Version**: Latest (installed via npm)
  - **Features**: PBR materials, shadow mapping, first-person controls, advanced collision detection
  - **Integration**: Standalone Vue component with proper lifecycle management
  - **Performance**: Optimized for web with 1K textures and efficient geometry
  - **3D Models**: GLTFLoader support for external .glb/.gltf assets with full PBR integration
  - **Collision System**: Raycaster-based surface detection for realistic 3D object interaction

### Three.js Performance Optimization - Critical Lessons Learned

#### Shadow Mapping Performance Crisis
**Problem**: Adding multiple 3D statues caused severe FPS drops (15-25 FPS) due to shadow system overload
**Root Cause**: 7+ shadow-casting lights with high-resolution shadow maps (1024x1024 each) = millions of shadow pixels per frame
**Impact**: GPU bottleneck, frame drops, stuttering during navigation

#### Critical Performance Bottlenecks Identified

1. **Shadow Map Resolution Explosion**
   ```javascript
   // PERFORMANCE KILLER (Multiple lights with high-res shadows)
   centralLight.shadow.mapSize.width = 1024  // 1MP per light
   spotLight.shadow.mapSize.width = 1024     // 1MP per light
   // Result: 7+ lights × 1MP = 7+ million shadow pixels per frame
   ```

2. **Invisible Lighting System Abuse**
   - 30+ lights total in scene (7+ invisible Thinker lights, mouse man lights, Cleo lights)
   - Each point light adding to GPU rendering load
   - No benefit vs performance cost analysis

3. **Renderer Configuration Issues**
   ```javascript
   // PERFORMANCE IMPACT
   antialias: true,                    // GPU intensive
   shadowMap.type: THREE.PCFSoftShadowMap  // Highest quality = slowest
   ```

4. **Uncapped Pixel Ratio**
   - High DPI displays (Retina, 4K) rendering at full native resolution
   - 2x-3x pixel density multiplying render load

#### Emergency FPS Optimization Solutions Applied

**Immediate Critical Fixes** (90% FPS improvement):
```javascript
// 1. DISABLE ALL SHADOWS (Emergency fix)
renderer.shadowMap.enabled = false  // Instant 70-90% FPS boost

// 2. OPTIMIZE RENDERER SETTINGS
antialias: false,                   // 15-25% FPS boost
powerPreference: 'high-performance', // Use dedicated GPU
setPixelRatio(Math.min(devicePixelRatio, 1.5)) // Cap high-DPI rendering

// 3. SHADOW TYPE OPTIMIZATION (when re-enabled)
shadowMap.type = THREE.BasicShadowMap  // Fastest shadow algorithm
```

**Shadow Map Resolution Strategy**:
```javascript
// BEFORE (Performance killer)
light.shadow.mapSize.width = 1024   // 1MP per light
light.shadow.mapSize.height = 1024  // Total: 7MP+ rendered per frame

// AFTER (Performance optimized)  
light.shadow.mapSize.width = 256    // 0.065MP per light
light.shadow.mapSize.height = 256   // Total: ~0.5MP rendered per frame
// Result: 93% reduction in shadow rendering load
```

#### Performance Monitoring System
```javascript
// Real-time FPS tracking implementation
let frameCount = 0, lastTime = 0, fps = 0
const updatePerformanceStats = () => {
  frameCount++
  const currentTime = performance.now()
  if (currentTime >= lastTime + 1000) {
    fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
    if (fps < 30) console.warn(`🔴 LOW FPS: ${fps}`)
    else if (fps < 50) console.log(`🟡 Moderate FPS: ${fps}`)
    else console.log(`🟢 Good FPS: ${fps}`)
    frameCount = 0
    lastTime = currentTime
  }
}
```

#### Three.js Performance Best Practices (Learned)

**Shadow System Rules**:
1. **Limit Shadow-Casting Lights**: Never exceed 2-3 shadow-casting lights in a scene
2. **Shadow Resolution Budget**: Total shadow map pixels < 1MP (1024×1024) across ALL lights
3. **Shadow Type Hierarchy**: BasicShadowMap > PCFShadowMap > PCFSoftShadowMap (performance order)
4. **Ambient Light Compensation**: Increase ambient lighting when reducing shadows

**Lighting Architecture**:
1. **1 Primary Shadow Light**: Main dramatic lighting with shadows
2. **Multiple Fill Lights**: No shadows, higher intensity for compensation
3. **Ambient Light**: Boost to 0.8-0.9 when shadows are reduced/disabled

**Renderer Optimization**:
1. **Antialias Decision**: Disable for performance, enable for visual quality
2. **Pixel Ratio Capping**: `Math.min(window.devicePixelRatio, 1.5)` prevents 4K overload
3. **Power Preference**: `high-performance` utilizes dedicated GPU on laptops

**Development Monitoring**:
1. **Real-time FPS Display**: Essential for performance development
2. **Performance Thresholds**: <30 FPS = critical, 30-50 = acceptable, 50+ = optimal
3. **GPU Memory Tracking**: Monitor shadow map memory usage

#### InstancedMesh for Repeated Objects (Future Optimization)
```javascript
// Instead of 4 individual couch models (4 draw calls)
// Use InstancedMesh (1 draw call for all couches)
const instancedCouches = new THREE.InstancedMesh(geometry, material, 4)
// 75% draw call reduction for repeated furniture
```

#### Critical Lesson Summary
**THE SHADOW MAP TRAP**: Adding "beautiful lighting" with multiple shadow-casting lights creates exponential performance degradation. Always profile FPS when adding lights, and consider shadows a premium feature to use sparingly.

**Performance First Principle**: A smoothly running 3D experience at 60 FPS with basic lighting is infinitely better than a cinematic experience at 15 FPS that users can't navigate properly.

### Three.js FPS Controls & Y-Axis Inversion

#### Gaming Context & Conventions
Y-axis inversion preferences in FPS games have roots in flight simulator controls, where pulling back on a joystick (or mouse) naturally makes the aircraft pitch up. This creates two distinct player preferences:

- **Normal/Standard**: Mouse up = look up, Mouse down = look down
- **Inverted**: Mouse up = look down, Mouse down = look up (flight sim style)

The gaming community is roughly split between these preferences, making it essential to provide this as a user setting rather than forcing one approach.

#### Three.js Implementation Approach

**Camera Hierarchy Pattern** (Most Robust):
- **Yaw Object**: Controls horizontal rotation (left/right)
- **Pitch Object**: Controls vertical rotation (up/down) 
- **Camera**: Child of pitch object, which is child of yaw object

This separation prevents gimbal lock and provides clean control over each rotation axis.

**Key Technical Elements**:

1. **Rotation Order**: Set camera rotation order to 'YXZ' to ensure yaw is applied before pitch, preventing unwanted roll behavior.

2. **Mouse Movement Capture**: Use either:
   - Standard mouse events for basic implementation
   - Pointer Lock API for true FPS experience (captures cursor, provides continuous movement)

3. **Movement Delta Processing**:
   - Capture `movementX` and `movementY` from mouse events
   - Apply sensitivity multiplier for user customization
   - For y-axis inversion: multiply vertical delta by -1

#### Best Practices

**Input Processing**:
- Normalize mouse input to be independent of screen resolution
- Apply sensitivity scaling to make controls customizable
- Implement smooth movement interpolation to avoid jittery camera motion

**Rotation Constraints**:
- Clamp pitch rotation (typically between -π/2 and π/2 radians) to prevent camera flipping
- Leave yaw rotation unclamped for full 360° horizontal movement
- Consider adding slight dead zones for very small movements

**User Experience**:
- **Always provide a settings toggle** for y-axis inversion
- Default to "normal" (non-inverted) as it's more intuitive for new players
- Consider adding a brief control test/calibration screen
- Store user preference in localStorage/settings

**Performance Considerations**:
- Use `requestAnimationFrame` for smooth camera updates
- Implement mouse sensitivity as a multiplier rather than recalculating each frame
- Consider using Three.js built-in controls as a starting point (PointerLockControls)

#### Implementation Strategy
1. Create separate objects for yaw and pitch control
2. Use event listeners to capture mouse movement
3. Apply movement deltas to respective rotation objects
4. Handle the inversion by conditionally negating the pitch delta
5. Integrate with game's configuration system for user preferences
6. Ensure compatibility with other camera behaviors (zoom, collision, etc.)

**Note**: Y-axis inversion should be treated as a fundamental accessibility feature rather than an advanced option, since player preferences are deeply ingrained and affect the core gameplay experience.

### Frontend Framework
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for build tooling and dev server

### Game Engine
- **Phaser.js 3** for interactive portfolio game
- **Hybrid Architecture**: Vue 3 + Phaser integration
- **Event Bridge**: Communication between Vue and Phaser

### Asset Management
- **Space Station Sprites**: CSS Sprite Maps from source images
  - `Five Intricate Space Stations in Orbit.png` (1024x1024)
  - `More Space Stations.png` (1536x1024)
- **Color Tinting**: Dynamic skill-based coloring
- **Performance**: 80x80px sprites, 60 FPS target

### Space Station Sprite System
- **Sprite Maps**: Extract regions from source images using coordinates
- **Color Variants**: 8 skill-specific color tints
- **Render Textures**: Dynamic sprite generation and tinting
- **Fallback System**: Geometric shapes if sprites fail to load

## Known Issues & Solutions

### Node.js v18 Compatibility
**Problem**: `TypeError: crypto.hash is not a function`
**Solution**: `nvm use 20.19.1` before running dev server

### Vite Cache Issues
**Problem**: Stale cache causing build errors
**Solution**: `rm -rf node_modules/.vite`

### Asset Loading
**Problem**: Large image files affecting performance
**Solution**: Sprite maps with region cropping

## Performance Optimizations
- Sprite maps vs individual files (reduces HTTP requests)
- 80x80px target size for consistent rendering
- Color tinting instead of multiple asset variants
- Render textures for dynamic sprite generation

## Input Mapping (Game)
- `WASD`/Arrow keys: movement
- `D`: Dock/undock/interact (replaces former SPACE behavior)
- `SPACE`: Fire lasers; holding creates a short-interval repeat until released

## Laser System
- Player lasers: procedural `laser-beam` texture (cyan), dual emitters near wing roots; velocity along forward vector.
- Enemy lasers: procedural `enemy-laser` texture (red), single emitter at nose, velocity straight along enemy facing (uses sprite rotation).
- Procedural texture `laser-beam` (6x28) with additive blend
- Dual emitters offset near wing roots; aligned to player rotation (forward vector)
- Lifetime cleanup (~2.5s) to prevent buildup
- Repeat interval currently 140ms; speed ~800px/s (tunable)

## Phaser 3 Collision Detection System

### Physics Systems Overview
Phaser 3 provides two main physics engines with different collision approaches:

#### Arcade Physics (Simple & Fast)
- **AABB (Axis-Aligned Bounding Box)** collision detection
- Performance-oriented for simple games
- Rectangle-based collision boundaries
- Suitable for platformers and simple space games

#### Matter Physics (Complex & Realistic)
- **Polygon-based collision detection** using Matter.js
- More realistic physics simulation
- Supports complex shapes and realistic physics
- Higher computational cost

### Collision vs Overlap Detection

**Collision**: Bodies physically separate when they touch (solid objects)
```javascript
// Bodies will separate on contact
this.physics.add.collider(player, platforms);
```

**Overlap**: Bodies can pass through each other, but events are triggered (sensors/triggers)
```javascript
// Bodies can pass through, but callback is triggered
this.physics.add.overlap(player, collectibles, collectItem);
```

### Collision Detection Process

1. **Broad Phase**: Quick spatial checks (grid/quadtree) to eliminate impossible collisions
2. **Narrow Phase**: Detailed collision math for potential collisions
3. **Collision Response**: Calculate separation, apply impulses, update positions

### Body Types & Properties

**Dynamic Bodies**: Can move and be affected by collisions
```javascript
player.body.setCollideWorldBounds(true);
player.body.setBounce(0.2); // 20% velocity bounce
```

**Static Bodies**: Cannot move but can be collided with
```javascript
platform.body.setImmovable(true);
```

### Collision Callbacks & Events

**Process Callback (Pre-collision)**:
```javascript
function processCallback(obj1, obj2) {
    // Return true to allow collision, false to prevent
    if (obj1.invulnerable) return false;
    return true;
}
```

**Collide Callback (Post-collision)**:
```javascript
function collideCallback(obj1, obj2) {
    // Handle collision effects after separation
    obj1.takeDamage();
    obj2.destroy();
}
```

### Advanced Collision Features

**Collision Categories** (Matter Physics):
```javascript
const PLAYER_CATEGORY = 0x0001;
const ENEMY_CATEGORY = 0x0002;
const PROJECTILE_CATEGORY = 0x0004;

player.setCollisionCategory(PLAYER_CATEGORY);
player.setCollidesWith([ENEMY_CATEGORY, WALL_CATEGORY]);
```

**World Boundaries**:
```javascript
world.checkCollision = {
    up: true,
    down: true,
    left: true,
    right: true
};
```

### Performance Optimization Rules

1. **Group Similar Objects**: Use physics groups for efficient collision checking
```javascript
const enemies = this.physics.add.group();
const bullets = this.physics.add.group();
this.physics.add.collider(bullets, enemies);
```

2. **Static vs Dynamic**: Use static bodies for immovable objects
3. **Collision Layers**: Organize collision detection by game logic layers
4. **Mass-based Separation**: Heavier objects move less during collisions

### Common Game Collision Patterns

**Space Game Pattern**:
```javascript
// Player vs boundaries
this.physics.add.collider(player, worldBounds);

// Player lasers vs enemies (destroy on hit)
this.physics.add.overlap(playerLasers, enemies, destroyEnemy);

// Player vs enemy lasers (damage/health system)
this.physics.add.overlap(player, enemyLasers, playerHit);

// Player vs enemies (collision damage)
this.physics.add.collider(player, enemies, playerCollision);
```

### Collision Resolution Properties

**Bounce & Friction**:
```javascript
body.setBounce(0.8);     // Energy retained after collision
body.setFriction(0.1);   // Movement resistance
```

**Mass & Velocity Transfer**:
```javascript
body.setMass(2);         // Affects collision response
// Collision affects both bodies based on mass, bounce, and impact angle
```

### Event System Integration

**Global Physics Events**:
```javascript
this.physics.world.on('collide', (event, bodyA, bodyB) => {
    // Handle any collision in the world
});
```

**Body-specific Events**:
```javascript
player.body.onCollide = true;
player.body.on('collide', (collision) => {
    // Handle collisions for specific body
});
```

This collision system enables complex game interactions while maintaining performance through spatial partitioning and optimized algorithms. The choice between Arcade and Matter physics depends on the complexity requirements of the game mechanics.