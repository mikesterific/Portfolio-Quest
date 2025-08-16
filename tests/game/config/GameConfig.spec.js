const { 
  PLAYER_CONFIG,
  COMBAT_CONFIG,
  SHIELD_CONFIG,
  UI_CONFIG,
  GAME_CONFIG,
  validateGameConfig,
  cloneGameConfig,
  mergeConfig
} = require('@/game/config')

describe('Game Configuration System', () => {
  describe('Individual Config Modules', () => {
    test('PLAYER_CONFIG has correct structure and values', () => {
      expect(PLAYER_CONFIG).toEqual({
        health: {
          max: 3,
          invulnerabilityDurationMs: 800
        }
      })
    })

    test('COMBAT_CONFIG has correct structure and values', () => {
      expect(COMBAT_CONFIG).toEqual({
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
      })
    })

    test('SHIELD_CONFIG has correct structure and values', () => {
      expect(SHIELD_CONFIG).toEqual({
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
      })
    })

    test('UI_CONFIG has correct structure and values', () => {
      expect(UI_CONFIG.radar).toEqual({
        radius: 130,
        gameWorldRadius: 450,
        updateIntervalMs: 500
      })

      expect(UI_CONFIG.proximity).toEqual({
        stationDetectionDistance: 80,
        portalDetectionDistance: 100
      })

      expect(UI_CONFIG.fonts.primary).toContain('Inter')
      expect(UI_CONFIG.colors.health).toBe('#FF6B6B')
      expect(UI_CONFIG.colors.xp).toBe('#F1C40F')
    })
  })

  describe('GAME_CONFIG Integration', () => {
    test('combines all individual configs correctly', () => {
      expect(GAME_CONFIG.player).toBe(PLAYER_CONFIG)
      expect(GAME_CONFIG.combat).toBe(COMBAT_CONFIG)
      expect(GAME_CONFIG.shields).toBe(SHIELD_CONFIG)
      expect(GAME_CONFIG.ui).toBe(UI_CONFIG)
    })
  })

  describe('Configuration Validation', () => {
    test('validates correct configuration without errors', () => {
      expect(() => validateGameConfig(GAME_CONFIG)).not.toThrow()
      expect(validateGameConfig(GAME_CONFIG)).toBe(true)
    })

    test('throws error for invalid player health', () => {
      const invalidConfig = {
        ...GAME_CONFIG,
        player: {
          ...GAME_CONFIG.player,
          health: { ...GAME_CONFIG.player.health, max: 0 }
        }
      }
      
      expect(() => validateGameConfig(invalidConfig)).toThrow('Player max health must be greater than 0')
    })

    test('throws error for invalid laser speed', () => {
      const invalidConfig = {
        ...GAME_CONFIG,
        combat: {
          ...GAME_CONFIG.combat,
          laser: { ...GAME_CONFIG.combat.laser, speedPxPerSecond: -100 }
        }
      }
      
      expect(() => validateGameConfig(invalidConfig)).toThrow('Laser speed must be greater than 0')
    })

    test('throws error for invalid shield geometry', () => {
      const invalidConfig = {
        ...GAME_CONFIG,
        shields: {
          ...GAME_CONFIG.shields,
          geometry: {
            ...GAME_CONFIG.shields.geometry,
            dockingRadius: 100, // Greater than barrier radius
            barrierRadius: 90
          }
        }
      }
      
      expect(() => validateGameConfig(invalidConfig)).toThrow('Shield docking radius must be less than barrier radius')
    })

    test('throws error for negative XP rewards', () => {
      const invalidConfig = {
        ...GAME_CONFIG,
        combat: {
          ...GAME_CONFIG.combat,
          xp: { ...GAME_CONFIG.combat.xp, enemyKillReward: -5 }
        }
      }
      
      expect(() => validateGameConfig(invalidConfig)).toThrow('XP rewards cannot be negative')
    })
  })

  describe('Configuration Utilities', () => {
    test('cloneGameConfig creates deep copy', () => {
      const clone = cloneGameConfig(GAME_CONFIG)
      
      expect(clone).toEqual(GAME_CONFIG)
      expect(clone).not.toBe(GAME_CONFIG)
      expect(clone.player).not.toBe(GAME_CONFIG.player)
      expect(clone.combat).not.toBe(GAME_CONFIG.combat)
      
      // Modifying clone should not affect original
      clone.player.health.max = 999
      expect(GAME_CONFIG.player.health.max).toBe(3)
    })

    test('mergeConfig combines base config with overrides', () => {
      const overrides = {
        player: {
          health: { max: 5 }
        },
        combat: {
          xp: { enemyKillReward: 25 }
        }
      }
      
      const merged = mergeConfig(GAME_CONFIG, overrides)
      
      expect(merged.player.health.max).toBe(5)
      expect(merged.player.health.invulnerabilityDurationMs).toBe(800) // Preserved from base
      expect(merged.combat.xp.enemyKillReward).toBe(25)
      expect(merged.combat.xp.stationDockReward).toBe(50) // Preserved from base
      expect(merged.shields).toEqual(GAME_CONFIG.shields) // Unchanged
    })

    test('mergeConfig validates the merged result', () => {
      const invalidOverrides = {
        player: {
          health: { max: -1 }
        }
      }
      
      expect(() => mergeConfig(GAME_CONFIG, invalidOverrides)).toThrow('Player max health must be greater than 0')
    })
  })

  describe('Configuration Values Consistency', () => {
    test('shield geometry values are logically ordered', () => {
      const { dockingRadius, barrierRadius, detectionRadius } = SHIELD_CONFIG.geometry
      
      expect(dockingRadius).toBeLessThan(barrierRadius)
      expect(barrierRadius).toBeLessThanOrEqual(detectionRadius)
    })

    test('timing values are reasonable', () => {
      expect(COMBAT_CONFIG.laser.lifetimeMs).toBeGreaterThan(COMBAT_CONFIG.laser.fireRepeatMs)
      expect(SHIELD_CONFIG.health.regenerationDelayMs).toBeGreaterThan(SHIELD_CONFIG.health.regenerationRate)
      expect(PLAYER_CONFIG.health.invulnerabilityDurationMs).toBeGreaterThan(0)
    })

    test('UI positioning values are positive', () => {
      expect(UI_CONFIG.positioning.healthDisplay.x).toBeGreaterThan(0)
      expect(UI_CONFIG.positioning.healthDisplay.y).toBeGreaterThan(0)
      expect(UI_CONFIG.positioning.xpDisplay.x).toBeGreaterThan(0)
      expect(UI_CONFIG.positioning.xpDisplay.y).toBeGreaterThan(0)
    })
  })
})
