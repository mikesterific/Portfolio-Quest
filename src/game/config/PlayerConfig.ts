/**
 * Player Configuration
 * Controls player health, invulnerability, and related mechanics
 */

export interface PlayerConfigInterface {
  health: {
    /** Maximum player health points */
    max: number;
    /** Invulnerability duration after taking damage (milliseconds) */
    invulnerabilityDurationMs: number;
  };
  shields: {
    /** Maximum shield charge points before health takes damage */
    max: number;
    /** Delay before shields fully regenerate after being hit (milliseconds) */
    regenerationDelayMs: number;
  };
}

export const PLAYER_CONFIG: PlayerConfigInterface = {
  health: {
    max: 3,
    invulnerabilityDurationMs: 800,
  },
  shields: {
    max: 3,
    regenerationDelayMs: 10000,
  },
};
