/**
 * Player Configuration
 * Controls player health, invulnerability, and related mechanics
 */

export interface PlayerConfigInterface {
  health: {
    /** Maximum player health points */
    max: number
    /** Invulnerability duration after taking damage (milliseconds) */
    invulnerabilityDurationMs: number
  }
}

export const PLAYER_CONFIG: PlayerConfigInterface = {
  health: {
    max: 3,
    invulnerabilityDurationMs: 800
  }
}
