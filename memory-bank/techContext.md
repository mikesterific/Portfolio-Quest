# Technical Context - Resume Game

## Technology Decisions

### Frontend Framework
- **Primary**: Phaser.js for 2D game interface and animations
- **UI Management**: Vue.js 3 for modals and portfolio components
- **Hybrid Approach**: Phaser for game world + Vue for popup modals
- **Build Tool**: Vite for fast development and optimized builds

### Development Tools
- **Game Engine**: Phaser.js (open-source, web-based game framework)
- **Build Tool**: Vite (fast development server and optimized builds)
- **Art Creation**: Aseprite ($20) or free alternatives like Pixel Studio
- **Animation**: Phaser's built-in animation system + GSAP for UI animations
- **Design**: Figma for UI elements and planning

### Backend Options
- **Static**: Pure frontend with JSON data files
- **Dynamic**: Node.js + Express + Firebase/MongoDB (if content management needed)
- **Assets**: Cloudinary or AWS S3 for media hosting

## Technical Requirements

### Performance
- 60 FPS on large displays via HDMI
- High-resolution canvas (1920x1080+) with scalable assets
- Optimized loading with compressed images and minified code
- Smooth animations without performance degradation

### Display Optimization
- Responsive design for multiple screen sizes
- HDMI-specific optimization for TV/monitor display
- Full-screen capability for presentations
- High-DPI support for 4K displays

### Accessibility
- Keyboard navigation (arrow keys for movement)
- Touch control support for mobile
- "Skip game" option for traditional portfolio view
- High-contrast colors and readable text
- Sound/music toggle options

## Infrastructure Needs
- **Hosting**: Netlify or Vercel for fast, free deployment
- **CDN**: Asset delivery optimization for global access
- **Domain**: Professional domain for business use
- **Analytics**: Basic tracking for visitor engagement insights

## Dependencies
### Core Libraries
- Phaser.js (game engine)
- Vue.js 3 (UI components and reactivity)
- Vite (build tool and dev server)
- GSAP (animations)

### Asset Dependencies
- Pixel-art sprite sheets and tilesets
- Sound effects and background music (optional)
- Portfolio images and project media
- Résumé content and formatting

### Development Dependencies
- **Node.js Version**: v20.x required (use `nvm use 20` to switch)
  - Fixes crypto.hash compatibility issues in Vite
  - Required for proper development server functionality
- Vite (primary build tool)
- Vue 3 CLI or create-vue for project scaffolding
- Asset optimization tools (built into Vite)
- Testing frameworks for cross-device compatibility (Vitest for unit tests)

## Functional Programming Implementation (NEW)

### Code Architecture Improvements
- **Functional Scene Design**: Phaser scenes now use functional patterns within class structure
- **Pure Function Utilities**: Shared mathematical and logic functions across scenes
- **Factory Pattern Implementation**: Consistent object creation through factory functions
- **State Management**: Centralized state interfaces replacing scattered properties

### Technical Benefits Achieved
- **Better Testability**: Pure functions can be unit tested in isolation
- **Improved Maintainability**: Shared utilities reduce code duplication across scenes
- **Enhanced Type Safety**: TypeScript interfaces for all data structures
- **Reduced Coupling**: Clean separation between data, behavior, and Phaser integration

### Shared Utility Functions
```typescript
// Cross-scene utilities implemented
- calculateDistance(): Distance calculations for proximity detection
- findNearestObject(): Generic nearest object detection algorithm
- updatePlayerVelocity(): Standardized player movement logic
- createPlayer(): Consistent player object creation

// Factory functions for game objects
- createSkillNPC(), createResumeBook(), createProjectChest()
- createPortal(): Standardized portal creation with consistent behavior
- setupWorldBackground(): Reusable background setup patterns
```

## Technical Constraints
- Web-based only (no native app development)
- Browser compatibility requirements (modern browsers)
- File size optimization for fast loading
- Mobile performance considerations
- Professional appearance requirements (no overly cartoonish elements)
- Sound/animation toggles for business contexts

---
*Part of Memory Bank System*