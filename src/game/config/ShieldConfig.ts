/**
 * Shield Configuration
 * Controls shield geometry, health, regeneration, and visual effects
 */

export interface ShieldConfigInterface {
  geometry: {
    /** Main shield radius for visual display (pixels) */
    radius: number
    /** Inner radius where ships can dock (pixels) */
    dockingRadius: number
    /** Middle radius that blocks projectiles (pixels) */
    barrierRadius: number
    /** Outer radius for early detection (pixels) */
    detectionRadius: number
  }
  health: {
    /** Maximum shield health points */
    max: number
    /** Time between shield regeneration ticks (milliseconds) */
    regenerationRate: number
    /** Delay before shield starts regenerating after being hit (milliseconds) */
    regenerationDelayMs: number
  }
  visual: {
    /** Base color for healthy shields (hex color) */
    baseColor: number
    /** Pulse animation settings */
    pulseAnimation: {
      /** Duration of one pulse cycle (milliseconds) */
      duration: number
      /** Scale range for pulse effect */
      scaleRange: { min: number; max: number }
    }
  }
}

export const SHIELD_CONFIG: ShieldConfigInterface = {
  geometry: {
    radius: 90,
    dockingRadius: 50,
    barrierRadius: 90,
    detectionRadius: 120
  },
  health: {
    max: 4,
    regenerationRate: 2000,
    regenerationDelayMs: 10000
  },
  visual: {
    baseColor: 0x00AAFF,
    pulseAnimation: {
      duration: 3000,
      scaleRange: { min: 0.98, max: 1.02 }
    }
  }
}
