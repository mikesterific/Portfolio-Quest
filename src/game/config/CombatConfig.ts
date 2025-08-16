/**
 * Combat Configuration
 * Controls weapons, combat mechanics, XP rewards, and collision detection
 */

export interface CombatConfigInterface {
  laser: {
    /** How long lasers exist before being destroyed (milliseconds) */
    lifetimeMs: number
    /** Time between laser shots when holding fire button (milliseconds) */
    fireRepeatMs: number
    /** Speed of laser projectiles (pixels per second) */
    speedPxPerSecond: number
  }
  xp: {
    /** XP awarded for destroying an enemy */
    enemyKillReward: number
    /** XP awarded for docking with a station */
    stationDockReward: number
  }
  collision: {
    /** How often to check for collisions between lasers and enemies (milliseconds) */
    checkIntervalMs: number
    /** Distance threshold for collision detection (pixels) */
    threshold: number
  }
}

export const COMBAT_CONFIG: CombatConfigInterface = {
  laser: {
    lifetimeMs: 2500,
    fireRepeatMs: 340,
    speedPxPerSecond: 800
  },
  xp: {
    enemyKillReward: 10,
    stationDockReward: 50
  },
  collision: {
    checkIntervalMs: 16,
    threshold: 50
  }
}
