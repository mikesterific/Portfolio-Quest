# Space Station Assets

This directory contains the space station sprites for the Skills Space Scene.

## Asset Configuration

See `station-data.ts` for the complete mapping between skills and station designs.

### Station Types
- **Type A**: Compact research modules (Frontend, Testing)
- **Type B**: Industrial platforms (Architecture, Security)  
- **Type C**: Large hub stations (Tooling, Leadership)
- **Type D**: Specialized research facilities (AI)
- **Type E**: Command stations (DevOps)

### Color Variants
- **Blue** (#4A6FA5): Frontend Development
- **Green** (#5FB85F): Testing Systems
- **Orange** (#E67E22): Architecture Hub
- **Purple** (#9B59B6): Tooling Platform
- **Red** (#E74C3C): DevOps Command
- **Gray** (#7F8C8D): Security Fortress
- **Cyan** (#1ABC9C): AI Research Station
- **Gold** (#F39C12): Leadership Center

## Current Assets

### Placeholder Sprites (Development)
Currently using generated placeholder sprites with recognizable station designs:
- `station-a-blue.png` - Frontend (Compact with communication arrays)
- `station-a-green.png` - Testing (Compact with communication arrays)
- `station-b-orange.png` - Architecture (Industrial platform with docking bays)
- `station-c-purple.png` - Tooling (Large hub with multiple sections)
- `station-e-red.png` - DevOps (Command station with control towers)
- `station-b-gray.png` - Security (Industrial platform with docking bays)
- `station-d-cyan.png` - AI (Specialized hexagonal research facility)
- `station-c-gold.png` - Leadership (Large hub with multiple sections)

### Production Assets (Planned)
To be extracted from `Five Intricate Space Stations in Orbit.png`:
1. Extract 5 base station designs from source image
2. Create color variations for each skill
3. Optimize for game performance (64x64 or 80x80px)
4. Maintain transparency for proper game integration

## Usage in Game

Each station sprite is loaded in `SkillSpaceScene.ts` and mapped to specific skills using the configuration from `station-data.ts`. The stations are positioned in three sectors:

- **Development Sector**: Frontend, Testing, Architecture
- **Infrastructure Sector**: Tooling, DevOps, Security
- **Innovation Hub**: AI, Leadership

## Asset Extraction Process

### Tools Needed
- Image editor (Photoshop, GIMP, or similar)
- PNG optimization tool

### Steps
1. Open `Five Intricate Space Stations in Orbit.png`
2. Identify 5 distinct station designs
3. Extract each station to individual 80x80px PNG files
4. Create color variants using the specified color palette
5. Optimize file sizes while maintaining quality
6. Replace placeholder files with extracted assets

### File Naming Convention
```
station-[type]-[color].png
```

Examples:
- `station-a-blue.png`
- `station-b-orange.png`
- `station-c-purple.png`

## Performance Considerations

- Target size: 80x80px for optimal performance
- Format: PNG with transparency
- Optimize file sizes for web loading
- Consider sprite atlases for production builds

## Integration with Phaser.js

Assets are preloaded in the scene and used as textures for interactive game objects. Each station maintains:
- Interactive hit box for player proximity detection
- Visual feedback effects (glow, docking indicators)
- Skill data mapping for modal integration 