import Phaser from 'phaser'

// Collision layer types
export enum CollisionLayer {
  PLAYER_SHIP = 'PLAYER_SHIP',
  ENEMY_SHIP = 'ENEMY_SHIP', 
  PLAYER_LASER = 'PLAYER_LASER',
  ENEMY_LASER = 'ENEMY_LASER',
  EFFECTS = 'EFFECTS'
}

// Collision behavior types
export enum CollisionBehavior {
  ALLOW = 'ALLOW',     // Object passes through
  BLOCK = 'BLOCK',     // Object is blocked/destroyed
  DETECT = 'DETECT',   // Object triggers detection but passes through
  IGNORE = 'IGNORE'    // No interaction
}

// Zone types within shields
export enum ShieldZone {
  DOCKING = 'DOCKING',      // Inner zone - safe for ships
  BARRIER = 'BARRIER',      // Middle zone - blocks projectiles
  DETECTION = 'DETECTION'   // Outer zone - early warning
}

// Configuration for shield zones
export interface ShieldZoneConfig {
  dockingRadius: number      // Inner zone radius
  barrierRadius: number      // Middle zone radius  
  detectionRadius: number    // Outer zone radius
  stationId: string
  position: Phaser.Math.Vector2
  isActive: boolean
}

// Collision result data
export interface ZoneCollisionResult {
  collision: boolean
  zone: ShieldZone | null
  behavior: CollisionBehavior
  stationId: string
  distance: number
}

// Simple occluder for LOS (e.g., station body)
export interface StationOccluder {
  stationId: string
  position: Phaser.Math.Vector2
  radius: number
}

// Collision rules matrix
interface CollisionLayerConfig {
  [CollisionLayer.PLAYER_SHIP]: {
    [ShieldZone.DOCKING]: CollisionBehavior,
    [ShieldZone.BARRIER]: CollisionBehavior,
    [ShieldZone.DETECTION]: CollisionBehavior
  },
  [CollisionLayer.ENEMY_SHIP]: {
    [ShieldZone.DOCKING]: CollisionBehavior.BLOCK,
    [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
    [ShieldZone.DETECTION]: CollisionBehavior.DETECT
  },
  [CollisionLayer.PLAYER_LASER]: {
    [ShieldZone.DOCKING]: CollisionBehavior.ALLOW,
    [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
    [ShieldZone.DETECTION]: CollisionBehavior.IGNORE
  },
  [CollisionLayer.ENEMY_LASER]: {
    [ShieldZone.DOCKING]: CollisionBehavior.ALLOW,
    [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
    [ShieldZone.DETECTION]: CollisionBehavior.IGNORE
  },
  [CollisionLayer.EFFECTS]: {
    [ShieldZone.DOCKING]: CollisionBehavior.ALLOW,
    [ShieldZone.BARRIER]: CollisionBehavior.ALLOW,
    [ShieldZone.DETECTION]: CollisionBehavior.ALLOW
  }
}

// Shield zone system for individual shields
export class ShieldZoneSystem {
  private config: ShieldZoneConfig
  private collisionRules: CollisionLayerConfig

  constructor(config: ShieldZoneConfig) {
    this.config = config
    
    // Initialize collision rules matrix
    this.collisionRules = {
      [CollisionLayer.PLAYER_SHIP]: {
        [ShieldZone.DOCKING]: CollisionBehavior.BLOCK,
        [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
        [ShieldZone.DETECTION]: CollisionBehavior.DETECT
      },
      [CollisionLayer.ENEMY_SHIP]: {
        [ShieldZone.DOCKING]: CollisionBehavior.BLOCK,
        [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
        [ShieldZone.DETECTION]: CollisionBehavior.DETECT
      },
      [CollisionLayer.PLAYER_LASER]: {
        [ShieldZone.DOCKING]: CollisionBehavior.ALLOW,
        [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
        [ShieldZone.DETECTION]: CollisionBehavior.IGNORE
      },
      [CollisionLayer.ENEMY_LASER]: {
        [ShieldZone.DOCKING]: CollisionBehavior.ALLOW,
        [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
        [ShieldZone.DETECTION]: CollisionBehavior.IGNORE
      },
      [CollisionLayer.EFFECTS]: {
        [ShieldZone.DOCKING]: CollisionBehavior.ALLOW,
        [ShieldZone.BARRIER]: CollisionBehavior.ALLOW,
        [ShieldZone.DETECTION]: CollisionBehavior.ALLOW
      }
    }
  }

  // Check collision for an object at given position
  checkCollision(objectPosition: Phaser.Math.Vector2, layer: CollisionLayer): ZoneCollisionResult {
    if (!this.config.isActive) {
      return {
        collision: false,
        zone: null,
        behavior: CollisionBehavior.ALLOW,
        stationId: this.config.stationId,
        distance: this.getDistance(objectPosition)
      }
    }

    const distance = this.getDistance(objectPosition)
    
    // Check zones from inner to outer
    if (distance <= this.config.dockingRadius) {
      return {
        collision: true,
        zone: ShieldZone.DOCKING,
        behavior: this.collisionRules[layer][ShieldZone.DOCKING],
        stationId: this.config.stationId,
        distance
      }
    } else if (distance <= this.config.barrierRadius) {
      return {
        collision: true,
        zone: ShieldZone.BARRIER,
        behavior: this.collisionRules[layer][ShieldZone.BARRIER],
        stationId: this.config.stationId,
        distance
      }
    } else if (distance <= this.config.detectionRadius) {
      return {
        collision: true,
        zone: ShieldZone.DETECTION,
        behavior: this.collisionRules[layer][ShieldZone.DETECTION],
        stationId: this.config.stationId,
        distance
      }
    }

    return {
      collision: false,
      zone: null,
      behavior: CollisionBehavior.ALLOW,
      stationId: this.config.stationId,
      distance
    }
  }

  // Get distance from object to shield center
  private getDistance(objectPosition: Phaser.Math.Vector2): number {
    return Phaser.Math.Distance.Between(
      objectPosition.x, objectPosition.y,
      this.config.position.x, this.config.position.y
    )
  }

  // Update shield state
  updateState(isActive: boolean): void {
    this.config.isActive = isActive
  }

  // Get shield configuration
  getConfig(): ShieldZoneConfig {
    return { ...this.config }
  }

  // Update shield position (if station moves)
  updatePosition(newPosition: Phaser.Math.Vector2): void {
    this.config.position = newPosition
  }
}

// Central manager for all shield systems
export class ShieldMapManager {
  private shields: Map<string, ShieldZoneSystem>
  private scene: Phaser.Scene
  private stationOccluders: Map<string, StationOccluder>

  constructor(scene: Phaser.Scene) {
    this.shields = new Map()
    this.scene = scene
    this.stationOccluders = new Map()
  }

  // Register a new shield system
  registerShield(stationId: string, config: ShieldZoneConfig): void {
    const shieldSystem = new ShieldZoneSystem(config)
    this.shields.set(stationId, shieldSystem)
  }

  // Get shield system for a specific station
  getShieldForStation(stationId: string): ShieldZoneSystem | null {
    return this.shields.get(stationId) || null
  }

  // Check collision against all shields for an object
  checkAllShieldCollisions(objectPosition: Phaser.Math.Vector2, layer: CollisionLayer): ZoneCollisionResult[] {
    const results: ZoneCollisionResult[] = []
    
    this.shields.forEach((shieldSystem) => {
      const result = shieldSystem.checkCollision(objectPosition, layer)
      if (result.collision && result.behavior !== CollisionBehavior.IGNORE) {
        results.push(result)
      }
    })

    return results
  }

  // Find the closest blocking shield collision
  getBlockingCollision(objectPosition: Phaser.Math.Vector2, layer: CollisionLayer): ZoneCollisionResult | null {
    const collisions = this.checkAllShieldCollisions(objectPosition, layer)
    const blockingCollisions = collisions.filter(c => c.behavior === CollisionBehavior.BLOCK)
    
    if (blockingCollisions.length === 0) return null
    
    // Return the closest blocking collision
    return blockingCollisions.reduce((closest, current) => 
      current.distance < closest.distance ? current : closest
    )
  }

  // Update shield state for a specific station
  updateShieldState(stationId: string, isActive: boolean): void {
    const shield = this.shields.get(stationId)
    if (shield) {
      shield.updateState(isActive)
    }
  }

  // Update all shield states globally
  updateGlobalShieldState(isActive: boolean): void {
    this.shields.forEach((shield) => {
      shield.updateState(isActive)
    })
  }

  // Get all shield configurations (for debugging/visualization)
  getAllShieldConfigs(): Map<string, ShieldZoneConfig> {
    const configs = new Map<string, ShieldZoneConfig>()
    this.shields.forEach((shield, stationId) => {
      configs.set(stationId, shield.getConfig())
    })
    return configs
  }

  // Remove a shield system
  removeShield(stationId: string): void {
    this.shields.delete(stationId)
  }

  // Clear all shields
  clearAllShields(): void {
    this.shields.clear()
  }

  // Get total number of shields
  getShieldCount(): number {
    return this.shields.size
  }

  // Check if any shields are active
  hasActiveShields(): boolean {
    for (const shield of this.shields.values()) {
      if (shield.getConfig().isActive) {
        return true
      }
    }
    return false
  }

  // ----- Station occluders (LOS) -----
  registerStationOccluder(stationId: string, position: Phaser.Math.Vector2, radius: number): void {
    this.stationOccluders.set(stationId, { stationId, position, radius })
  }

  updateStationOccluderPosition(stationId: string, newPosition: Phaser.Math.Vector2): void {
    const occ = this.stationOccluders.get(stationId)
    if (occ) {
      occ.position = newPosition
    }
  }

  removeStationOccluder(stationId: string): void {
    this.stationOccluders.delete(stationId)
  }

  clearStationOccluders(): void {
    this.stationOccluders.clear()
  }

  getStationOccluders(): StationOccluder[] {
    return Array.from(this.stationOccluders.values())
  }

  // Sampled LOS check against station occluders
  isLineBlockedByStationsWithSamples(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2, samples: number = 6): boolean {
    if (this.stationOccluders.size === 0) return false
    const count = Math.max(3, samples)
    for (let i = 1; i < count; i++) {
      const t = i / count
      const p = from.clone().lerp(to, t)
      for (const occ of this.stationOccluders.values()) {
        const d = Phaser.Math.Distance.Between(p.x, p.y, occ.position.x, occ.position.y)
        if (d <= occ.radius) {
          return true
        }
      }
    }
    return false
  }
}

// Helper functions for common collision layer detection
export class CollisionLayerHelper {
  
  // Determine collision layer from game object
  static getCollisionLayer(gameObject: Phaser.GameObjects.GameObject): CollisionLayer {
    const data = gameObject.getData('collisionLayer')
    if (data) return data as CollisionLayer

    // Fallback detection based on object properties
    if (gameObject.getData('isPlayer')) return CollisionLayer.PLAYER_SHIP
    if (gameObject.getData('isEnemy')) return CollisionLayer.ENEMY_SHIP
    if (gameObject.getData('isPlayerLaser')) return CollisionLayer.PLAYER_LASER
    if (gameObject.getData('isEnemyLaser')) return CollisionLayer.ENEMY_LASER
    
    return CollisionLayer.EFFECTS // Default fallback
  }

  // Set collision layer on game object
  static setCollisionLayer(gameObject: Phaser.GameObjects.GameObject, layer: CollisionLayer): void {
    gameObject.setData('collisionLayer', layer)
  }

  // Check if object should be blocked by shields
  static shouldBlock(layer: CollisionLayer, zone: ShieldZone): boolean {
    const rules: CollisionLayerConfig = {
      [CollisionLayer.PLAYER_SHIP]: {
        [ShieldZone.DOCKING]: CollisionBehavior.BLOCK,
        [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
        [ShieldZone.DETECTION]: CollisionBehavior.DETECT
      },
      [CollisionLayer.ENEMY_SHIP]: {
        [ShieldZone.DOCKING]: CollisionBehavior.BLOCK,
        [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
        [ShieldZone.DETECTION]: CollisionBehavior.DETECT
      },
      [CollisionLayer.PLAYER_LASER]: {
        [ShieldZone.DOCKING]: CollisionBehavior.ALLOW,
        [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
        [ShieldZone.DETECTION]: CollisionBehavior.IGNORE
      },
      [CollisionLayer.ENEMY_LASER]: {
        [ShieldZone.DOCKING]: CollisionBehavior.ALLOW,
        [ShieldZone.BARRIER]: CollisionBehavior.BLOCK,
        [ShieldZone.DETECTION]: CollisionBehavior.IGNORE
      },
      [CollisionLayer.EFFECTS]: {
        [ShieldZone.DOCKING]: CollisionBehavior.ALLOW,
        [ShieldZone.BARRIER]: CollisionBehavior.ALLOW,
        [ShieldZone.DETECTION]: CollisionBehavior.ALLOW
      }
    }

    return rules[layer][zone] === CollisionBehavior.BLOCK
  }
}
