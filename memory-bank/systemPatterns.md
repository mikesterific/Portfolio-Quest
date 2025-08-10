# System Patterns - Resume Game

## Architecture Patterns

### Hybrid Game-Web Architecture
- **Game Layer**: Phaser.js canvas for 2D world and character interactions
- **UI Layer**: Vue 3 components for modals, forms, and traditional elements
- **Data Layer**: JSON configuration for portfolio content and game world data
- **Asset Layer**: Optimized sprite sheets, tilesets, and media files

### Component Structure
```
Portfolio Quest/
├── Game Engine (Phaser.js)
│   ├── Scene Management (different game areas)
│   ├── Character Controller
│   ├── Interaction System
│   └── Animation Engine
├── UI Framework (Vue 3)
│   ├── Modal Components (project details)
│   ├── Navigation Components
│   └── Traditional Portfolio Views
└── Data Management
    ├── Portfolio JSON data
    ├── Game Configuration
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
*Part of Memory Bank System*