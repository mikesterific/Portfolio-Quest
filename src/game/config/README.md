# Game Configuration System

This directory contains the centralized game configuration system that makes it easy to modify game mechanics without touching the code.

## 📁 Structure

```
src/game/config/
├── PlayerConfig.ts       # Player health, invulnerability settings
├── CombatConfig.ts       # Weapons, XP rewards, collision detection
├── ShieldConfig.ts       # Shield geometry, health, regeneration
├── UIConfig.ts           # Radar, proximity, positioning, styling
├── GameConfig.ts         # Main config combining all modules
├── index.ts              # Barrel exports
└── README.md             # This file
```

## 🚀 Quick Start

### Import the configuration

```typescript
// Import individual configs
import { PLAYER_CONFIG, COMBAT_CONFIG, SHIELD_CONFIG, UI_CONFIG } from '@/game/config'

// Or import the combined config
import { GAME_CONFIG } from '@/game/config'

// Use in your code
const playerMaxHealth = PLAYER_CONFIG.health.max
const laserSpeed = COMBAT_CONFIG.laser.speedPxPerSecond
const shieldRadius = SHIELD_CONFIG.geometry.radius
```

### Modify game settings

Simply edit the values in the config files:

```typescript
// In CombatConfig.ts - make the game easier
export const COMBAT_CONFIG: CombatConfigInterface = {
  laser: {
    lifetimeMs: 3000,        // Longer laser lifetime
    fireRepeatMs: 100,       // Faster firing
    speedPxPerSecond: 1000   // Faster laser speed
  },
  xp: {
    enemyKillReward: 25,     // More XP for kills
    stationDockReward: 100   // More XP for docking
  }
}
```

## ⚙️ Configuration Categories

### 🎮 Player Configuration
- **Health**: Maximum health and invulnerability duration
- **Movement**: (Future: speed, acceleration)

```typescript
PLAYER_CONFIG.health.max                        // 3
PLAYER_CONFIG.health.invulnerabilityDurationMs  // 800ms
```

### ⚔️ Combat Configuration
- **Lasers**: Speed, lifetime, firing rate
- **XP Rewards**: Points for various actions
- **Collision**: Detection parameters

```typescript
COMBAT_CONFIG.laser.speedPxPerSecond    // 800
COMBAT_CONFIG.xp.enemyKillReward        // 10
COMBAT_CONFIG.collision.threshold       // 50
```

### 🛡️ Shield Configuration
- **Geometry**: Radii for different zones
- **Health**: Max health and regeneration
- **Visual**: Colors and animations

```typescript
SHIELD_CONFIG.geometry.dockingRadius    // 50
SHIELD_CONFIG.health.max                // 4
SHIELD_CONFIG.visual.baseColor          // 0x00AAFF
```

### 🖥️ UI Configuration
- **Radar**: Display radius and update rate
- **Proximity**: Detection distances
- **Positioning**: UI element locations
- **Styling**: Fonts and colors

```typescript
UI_CONFIG.radar.radius                  // 130
UI_CONFIG.proximity.stationDetectionDistance  // 80
UI_CONFIG.positioning.healthDisplay.x  // 24
UI_CONFIG.colors.health                 // '#FF6B6B'
```

## 🔧 Advanced Usage

### Configuration Validation

The system includes automatic validation:

```typescript
import { validateGameConfig, GAME_CONFIG } from '@/game/config'

try {
  validateGameConfig(GAME_CONFIG)
  console.log('✅ Configuration is valid!')
} catch (error) {
  console.error('❌ Invalid configuration:', error.message)
}
```

### Environment-Specific Overrides

Create different settings for development/testing:

```typescript
import { mergeConfig, GAME_CONFIG } from '@/game/config'

// Development config with easier settings
const DEV_OVERRIDES = {
  player: {
    health: { max: 10 }  // More health for testing
  },
  combat: {
    xp: { 
      enemyKillReward: 100,    // More XP for faster testing
      stationDockReward: 500 
    }
  }
}

const devConfig = mergeConfig(GAME_CONFIG, DEV_OVERRIDES)
```

### Creating Configuration Presets

```typescript
// Easy mode preset
const EASY_MODE = {
  player: { health: { max: 5, invulnerabilityDurationMs: 1500 } },
  combat: { 
    laser: { fireRepeatMs: 80 },
    xp: { enemyKillReward: 20, stationDockReward: 100 }
  },
  shields: { health: { max: 2 } }  // Weaker shields
}

// Hard mode preset  
const HARD_MODE = {
  player: { health: { max: 1, invulnerabilityDurationMs: 400 } },
  combat: { 
    laser: { fireRepeatMs: 200 },
    xp: { enemyKillReward: 5, stationDockReward: 25 }
  },
  shields: { health: { max: 8 } }  // Stronger shields
}
```

## 🎯 Configuration Guidelines

### ✅ Do:
- **Group related settings** in the same config module
- **Use descriptive names** with units (e.g., `durationMs`, `speedPxPerSecond`)
- **Add JSDoc comments** explaining what each setting does
- **Test changes** to ensure they don't break gameplay
- **Keep values reasonable** - the validation will catch some issues

### ❌ Don't:
- **Hardcode values** in the game scenes - use config instead
- **Make breaking changes** without updating dependent code
- **Skip validation** - always run tests after config changes
- **Use magic numbers** - create named constants instead

## 🧪 Testing Your Changes

Always run tests after modifying configurations:

```bash
# Test the configuration system
npm test tests/game/config/

# Test the managers that use configs
npm test tests/game/managers/

# Test the full game (if available)
npm test
```

## 🔍 Debugging Configuration Issues

If you encounter problems:

1. **Check validation errors**: The system will tell you what's wrong
2. **Verify imports**: Make sure you're importing from `@/game/config`
3. **Check TypeScript errors**: Invalid config structures will show as type errors
4. **Test in isolation**: Use the config tests to verify your changes

## 🚀 Future Enhancements

Potential additions to the configuration system:

- **Audio settings**: Volume levels, sound effects
- **Graphics settings**: Particle density, animation quality
- **Difficulty levels**: Predefined easy/normal/hard presets
- **User preferences**: Customizable controls, UI themes
- **Analytics tracking**: Event logging configuration

---

This configuration system makes the game highly customizable and maintainable. Happy configuring! 🎮
