/**
 * Game Configuration Module
 * Barrel export file for easy importing of all configuration types and values
 */

// Individual configuration modules
export * from './PlayerConfig'
export * from './CombatConfig'
export * from './ShieldConfig'
export * from './UIConfig'
export * from './GameConfig'

// Default export for the main game configuration
export { GAME_CONFIG as default } from './GameConfig'
