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