import Phaser from 'phaser'
import { SkillSpaceScene } from './scenes/SkillSpaceScene'
import { ProjectForestScene } from './scenes/ProjectForestScene'
import { ResumeTowerScene } from './scenes/ResumeTowerScene'
import { GameUIScene } from './scenes/GameUIScene'

/**
 * Phaser game configuration for Portfolio Quest
 * Optimized for HDMI display and responsive design
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 600
    },
    max: {
      width: 3840,
      height: 2160
    }
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },

  scene: [
    GameUIScene,
    SkillSpaceScene,
    ProjectForestScene,
    ResumeTowerScene
  ],

  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false
  },

  fps: {
    target: 60,
    forceSetTimeOut: true
  },

  input: {
    keyboard: true,
    mouse: true,
    touch: true,
    gamepad: false
  },

  plugins: {
    global: []
  }
}

export default gameConfig