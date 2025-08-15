/**
 * Main Game Configuration
 * Combines all individual configuration modules and provides validation
 */

import { PLAYER_CONFIG, type PlayerConfigInterface } from './PlayerConfig'
import { COMBAT_CONFIG, type CombatConfigInterface } from './CombatConfig'
import { SHIELD_CONFIG, type ShieldConfigInterface } from './ShieldConfig'
import { UI_CONFIG, type UIConfigInterface } from './UIConfig'

export interface GameConfigInterface {
  player: PlayerConfigInterface
  combat: CombatConfigInterface
  shields: ShieldConfigInterface
  ui: UIConfigInterface
}

export const GAME_CONFIG: GameConfigInterface = {
  player: PLAYER_CONFIG,
  combat: COMBAT_CONFIG,
  shields: SHIELD_CONFIG,
  ui: UI_CONFIG
}

/**
 * Validates the game configuration to ensure all values are reasonable
 * Throws an error if any configuration is invalid
 */
export const validateGameConfig = (config: GameConfigInterface): boolean => {
  const { player, combat, shields, ui } = config
  
  // Validate player configuration
  if (player.health.max <= 0) {
    throw new Error('Player max health must be greater than 0')
  }
  if (player.health.invulnerabilityDurationMs < 0) {
    throw new Error('Player invulnerability duration cannot be negative')
  }
  
  // Validate combat configuration
  if (combat.laser.speedPxPerSecond <= 0) {
    throw new Error('Laser speed must be greater than 0')
  }
  if (combat.laser.lifetimeMs <= 0) {
    throw new Error('Laser lifetime must be greater than 0')
  }
  if (combat.laser.fireRepeatMs <= 0) {
    throw new Error('Laser fire repeat interval must be greater than 0')
  }
  if (combat.xp.enemyKillReward < 0 || combat.xp.stationDockReward < 0) {
    throw new Error('XP rewards cannot be negative')
  }
  if (combat.collision.checkIntervalMs <= 0) {
    throw new Error('Collision check interval must be greater than 0')
  }
  if (combat.collision.threshold <= 0) {
    throw new Error('Collision threshold must be greater than 0')
  }
  
  // Validate shield configuration
  const { dockingRadius, barrierRadius, detectionRadius } = shields.geometry
  if (dockingRadius <= 0 || barrierRadius <= 0 || detectionRadius <= 0) {
    throw new Error('All shield radii must be greater than 0')
  }
  if (dockingRadius >= barrierRadius) {
    throw new Error('Shield docking radius must be less than barrier radius')
  }
  if (barrierRadius > detectionRadius) {
    throw new Error('Shield barrier radius must be less than or equal to detection radius')
  }
  if (shields.health.max <= 0) {
    throw new Error('Shield max health must be greater than 0')
  }
  if (shields.health.regenerationRate <= 0) {
    throw new Error('Shield regeneration rate must be greater than 0')
  }
  if (shields.health.regenerationDelayMs < 0) {
    throw new Error('Shield regeneration delay cannot be negative')
  }
  if (shields.visual.pulseAnimation.duration <= 0) {
    throw new Error('Shield pulse animation duration must be greater than 0')
  }
  
  // Validate UI configuration
  if (ui.radar.radius <= 0 || ui.radar.gameWorldRadius <= 0) {
    throw new Error('Radar radii must be greater than 0')
  }
  if (ui.radar.updateIntervalMs <= 0) {
    throw new Error('Radar update interval must be greater than 0')
  }
  if (ui.proximity.stationDetectionDistance <= 0 || ui.proximity.portalDetectionDistance <= 0) {
    throw new Error('Proximity detection distances must be greater than 0')
  }
  
  return true
}

/**
 * Creates a deep copy of the game configuration
 * Useful for creating environment-specific overrides
 */
export const cloneGameConfig = (config: GameConfigInterface): GameConfigInterface => {
  return JSON.parse(JSON.stringify(config))
}

/**
 * Merges configuration overrides with the base configuration
 * Useful for environment-specific settings or user preferences
 */
export const mergeConfig = (
  baseConfig: GameConfigInterface, 
  overrides: Partial<GameConfigInterface>
): GameConfigInterface => {
  const merged = cloneGameConfig(baseConfig)
  
  if (overrides.player) {
    if (overrides.player.health) {
      merged.player = {
        ...merged.player,
        ...overrides.player,
        health: { ...merged.player.health, ...overrides.player.health }
      }
    } else {
      merged.player = { ...merged.player, ...overrides.player }
    }
  }
  
  if (overrides.combat) {
    merged.combat = {
      ...merged.combat,
      ...overrides.combat,
      ...(overrides.combat.laser && { laser: { ...merged.combat.laser, ...overrides.combat.laser } }),
      ...(overrides.combat.xp && { xp: { ...merged.combat.xp, ...overrides.combat.xp } }),
      ...(overrides.combat.collision && { collision: { ...merged.combat.collision, ...overrides.combat.collision } })
    }
  }
  
  if (overrides.shields) {
    merged.shields = { ...merged.shields, ...overrides.shields }
    if (overrides.shields.geometry) {
      merged.shields.geometry = { ...merged.shields.geometry, ...overrides.shields.geometry }
    }
    if (overrides.shields.health) {
      merged.shields.health = { ...merged.shields.health, ...overrides.shields.health }
    }
    if (overrides.shields.visual) {
      merged.shields.visual = { ...merged.shields.visual, ...overrides.shields.visual }
      if (overrides.shields.visual.pulseAnimation) {
        merged.shields.visual.pulseAnimation = { 
          ...merged.shields.visual.pulseAnimation, 
          ...overrides.shields.visual.pulseAnimation 
        }
      }
    }
  }
  
  if (overrides.ui) {
    merged.ui = { ...merged.ui, ...overrides.ui }
    if (overrides.ui.radar) {
      merged.ui.radar = { ...merged.ui.radar, ...overrides.ui.radar }
    }
    if (overrides.ui.proximity) {
      merged.ui.proximity = { ...merged.ui.proximity, ...overrides.ui.proximity }
    }
    if (overrides.ui.positioning) {
      merged.ui.positioning = { ...merged.ui.positioning, ...overrides.ui.positioning }
    }
    if (overrides.ui.fonts) {
      merged.ui.fonts = { ...merged.ui.fonts, ...overrides.ui.fonts }
    }
    if (overrides.ui.colors) {
      merged.ui.colors = { ...merged.ui.colors, ...overrides.ui.colors }
    }
  }
  
  // Validate the merged configuration
  validateGameConfig(merged)
  
  return merged
}
