import Phaser from 'phaser'
import { ShieldMapManager, CollisionLayer } from './ShieldMappingSystem'

/**
 * Enemy AI System - Centralized enemy behavior management for Portfolio Quest
 * Handles enemy spawning, movement, targeting, and shield avoidance
 */

// Behavior states for enemy AI
export enum BehaviorState {
  IDLE = 'IDLE',
  PATROL = 'PATROL', 
  SEEK = 'SEEK',
  EVADE = 'EVADE',
  RETREAT = 'RETREAT'
}

// Enemy configuration
export interface EnemyConfig {
  speed: number
  acceleration: number
  drag: number
  turnRate: number // radians per second
  engagementDistance: number
  minDistance: number
  maxDistance: number
  fireRate: number // milliseconds between shots
  health: number
  maxHealth: number
  patrolRadius: number
  avoidanceRadius: number
}

// Enemy agent state
export interface EnemyAgent {
  id: string
  sprite: Phaser.GameObjects.Sprite
  config: EnemyConfig
  behavior: BehaviorState
  target: Phaser.Math.Vector2 | null
  patrolCenter: Phaser.Math.Vector2
  patrolAngle: number
  lastFireTime: number
  lastAvoidanceTime: number
  health: number
  isActive: boolean
}

// Enemy AI system state
interface EnemyAIState {
  agents: Map<string, EnemyAgent>
  scene: Phaser.Scene
  shieldManager: ShieldMapManager | null
  playerTarget: Phaser.GameObjects.Sprite | null
  combatEnabled: boolean
  nextAgentId: number
  maxEnemies: number
  spawnRadius: number
  enemyLasers: Phaser.GameObjects.Group | null
}

// Default enemy configuration
const DEFAULT_ENEMY_CONFIG: EnemyConfig = {
  speed: 120,
  acceleration: 60,
  drag: 200,
  turnRate: Math.PI, // 180 degrees per second
  engagementDistance: 400,
  minDistance: 100,
  maxDistance: 500,
  fireRate: 1200, // 1.2 seconds between shots
  health: 1,
  maxHealth: 1,
  patrolRadius: 150,
  avoidanceRadius: 80
}

/**
 * Steering helper functions
 */
const SteeringHelpers = {
  // Seek toward a target position
  seek(position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, maxSpeed: number): Phaser.Math.Vector2 {
    const desired = target.clone().subtract(position).normalize().scale(maxSpeed)
    return desired
  },

  // Flee away from a target position
  flee(position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, maxSpeed: number): Phaser.Math.Vector2 {
    const desired = position.clone().subtract(target).normalize().scale(maxSpeed)
    return desired
  },

  // Arrive at target with deceleration
  arrive(position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, maxSpeed: number, slowingRadius: number = 100): Phaser.Math.Vector2 {
    const toTarget = target.clone().subtract(position)
    const distance = toTarget.length()
    
    if (distance < 2) return new Phaser.Math.Vector2(0, 0)
    
    let speed = maxSpeed
    if (distance <= slowingRadius) {
      speed = maxSpeed * (distance / slowingRadius)
    }
    
    const desired = toTarget.normalize().scale(speed)
    return desired
  },

  // Wander around current position
  wander(position: Phaser.Math.Vector2, angle: number, radius: number, maxSpeed: number): Phaser.Math.Vector2 {
    const target = new Phaser.Math.Vector2(
      position.x + Math.cos(angle) * radius,
      position.y + Math.sin(angle) * radius
    )
    return this.seek(position, target, maxSpeed)
  },

  // Avoid shield barriers
  avoidShields(
    position: Phaser.Math.Vector2, 
    velocity: Phaser.Math.Vector2,
    shieldManager: ShieldMapManager,
    avoidanceRadius: number
  ): Phaser.Math.Vector2 {
    const blocking = shieldManager.getBlockingCollision(position, CollisionLayer.ENEMY_SHIP)
    
    if (!blocking || !blocking.zone) {
      return new Phaser.Math.Vector2(0, 0)
    }

    // Get shield config to find center
    const shieldSystem = shieldManager.getShieldForStation(blocking.stationId)
    if (!shieldSystem) return new Phaser.Math.Vector2(0, 0)
    
    const shieldCenter = shieldSystem.getConfig().position
    const awayFromShield = position.clone().subtract(shieldCenter).normalize()
    
    // Scale avoidance force based on proximity
    const avoidanceForce = awayFromShield.scale(avoidanceRadius * 2)
    return avoidanceForce
  }
}

/**
 * Enemy AI System class
 */
export class EnemyAISystem {
  private state: EnemyAIState

  constructor(scene: Phaser.Scene, shieldManager: ShieldMapManager | null = null) {
    this.state = {
      agents: new Map(),
      scene,
      shieldManager,
      playerTarget: null,
      combatEnabled: true,
      nextAgentId: 1,
      maxEnemies: 10,
      spawnRadius: 300,
      enemyLasers: null
    }
  }

  // Initialize with enemy laser group
  initialize(enemyLasers: Phaser.GameObjects.Group): void {
    this.state.enemyLasers = enemyLasers
  }

  // Set player target for AI
  setPlayerTarget(player: Phaser.GameObjects.Sprite): void {
    this.state.playerTarget = player
  }

  // Set shield manager
  setShieldManager(shieldManager: ShieldMapManager): void {
    this.state.shieldManager = shieldManager
  }

  // Enable/disable combat
  setCombatEnabled(enabled: boolean): void {
    this.state.combatEnabled = enabled
  }

  // Create a new enemy agent
  createEnemy(x: number, y: number, config: Partial<EnemyConfig> = {}): EnemyAgent {
    const enemyConfig = { ...DEFAULT_ENEMY_CONFIG, ...config }
    const agentId = `enemy_${this.state.nextAgentId++}`

    // Create enemy sprite
    const sprite = this.state.scene.add.sprite(x, y, 'enemy-ship')
    sprite.setDisplaySize(96, 96)
    sprite.setDepth(5)
    sprite.setRotation(Math.PI / 2) // Face right initially
    
    // Add physics
    this.state.scene.physics.add.existing(sprite)
    const body = sprite.body as Phaser.Physics.Arcade.Body
    body.setDrag(enemyConfig.drag)
    
    // Set collision layer and data
    sprite.setData('collisionLayer', CollisionLayer.ENEMY_SHIP)
    sprite.setData('isEnemy', true)
    sprite.setData('enemyId', agentId)

    // Create agent
    const agent: EnemyAgent = {
      id: agentId,
      sprite,
      config: enemyConfig,
      behavior: BehaviorState.PATROL,
      target: null,
      patrolCenter: new Phaser.Math.Vector2(x, y),
      patrolAngle: Math.random() * Math.PI * 2,
      lastFireTime: 0,
      lastAvoidanceTime: 0,
      health: enemyConfig.health,
      isActive: true
    }

    this.state.agents.set(agentId, agent)
    return agent
  }

  // Spawn a wave of enemies
  spawnWave(count: number = 3): void {
    if (!this.state.playerTarget) return

    const centerX = this.state.scene.scale.width / 2
    const centerY = this.state.scene.scale.height / 2

    for (let i = 0; i < count && this.state.agents.size < this.state.maxEnemies; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const spawnX = centerX + Math.cos(angle) * this.state.spawnRadius
      const spawnY = centerY + Math.sin(angle) * this.state.spawnRadius
      
      // Ensure spawn is within scene bounds
      const clampedX = Phaser.Math.Clamp(spawnX, 50, this.state.scene.scale.width - 50)
      const clampedY = Phaser.Math.Clamp(spawnY, 50, this.state.scene.scale.height - 50)
      
      this.createEnemy(clampedX, clampedY)
    }
  }

  // Remove an enemy agent
  removeEnemy(agentId: string): void {
    const agent = this.state.agents.get(agentId)
    if (agent) {
      agent.sprite.destroy()
      this.state.agents.delete(agentId)
    }
  }

  // Remove all enemies
  despawnAll(): void {
    this.state.agents.forEach(agent => {
      agent.sprite.destroy()
    })
    this.state.agents.clear()
  }

  // Update all enemies
  updateAll(time: number, delta: number): void {
    if (!this.state.combatEnabled || !this.state.playerTarget) return

    this.state.agents.forEach(agent => {
      if (agent.isActive) {
        this.updateAgent(agent, time, delta)
      }
    })
  }

  // Update individual agent
  private updateAgent(agent: EnemyAgent, time: number, delta: number): void {
    const position = new Phaser.Math.Vector2(agent.sprite.x, agent.sprite.y)
    const body = agent.sprite.body as Phaser.Physics.Arcade.Body
    
    // Update behavior based on current state
    let desiredVelocity = this.updateBehavior(agent, position, time)

    // Apply shield avoidance if needed
    if (this.state.shieldManager && time - agent.lastAvoidanceTime > 200) {
      const currentVelocity = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y)
      const avoidance = SteeringHelpers.avoidShields(
        position, 
        currentVelocity, 
        this.state.shieldManager, 
        agent.config.avoidanceRadius
      )
      
      if (avoidance.length() > 0) {
        desiredVelocity = avoidance
        agent.lastAvoidanceTime = time
      }
    }

    // Apply steering
    this.applySteering(agent, desiredVelocity, delta)

    // Update rotation to face movement direction
    this.updateRotation(agent)

    // Handle firing
    this.updateFiring(agent, time)
  }

  // Update agent behavior based on state
  private updateBehavior(agent: EnemyAgent, position: Phaser.Math.Vector2, time: number): Phaser.Math.Vector2 {
    if (!this.state.playerTarget) return new Phaser.Math.Vector2(0, 0)

    const playerPos = new Phaser.Math.Vector2(this.state.playerTarget.x, this.state.playerTarget.y)
    const distanceToPlayer = position.distance(playerPos)

    // State transitions
    if (distanceToPlayer < agent.config.minDistance) {
      agent.behavior = BehaviorState.EVADE
    } else if (distanceToPlayer > agent.config.maxDistance) {
      agent.behavior = BehaviorState.SEEK
    } else if (distanceToPlayer < agent.config.engagementDistance) {
      agent.behavior = BehaviorState.SEEK
    } else {
      agent.behavior = BehaviorState.PATROL
    }

    // Execute behavior
    switch (agent.behavior) {
      case BehaviorState.PATROL:
        // Advance patrol angle using a fixed timestep factor
        agent.patrolAngle += 0.5 * (1 / 60)
        return SteeringHelpers.wander(
          agent.patrolCenter, 
          agent.patrolAngle, 
          agent.config.patrolRadius, 
          agent.config.speed * 0.6
        )

      case BehaviorState.SEEK:
        return SteeringHelpers.arrive(position, playerPos, agent.config.speed, agent.config.minDistance)

      case BehaviorState.EVADE:
        return SteeringHelpers.flee(position, playerPos, agent.config.speed)

      default:
        return new Phaser.Math.Vector2(0, 0)
    }
  }

  // Apply steering force to agent
  private applySteering(agent: EnemyAgent, desiredVelocity: Phaser.Math.Vector2, delta: number): void {
    const body = agent.sprite.body as Phaser.Physics.Arcade.Body
    const currentVelocity = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y)
    
    // Calculate steering force
    const steering = desiredVelocity.clone().subtract(currentVelocity)
    const maxForce = agent.config.acceleration * (delta / 1000)
    
    if (steering.length() > maxForce) {
      steering.normalize().scale(maxForce)
    }

    const newVelocity = currentVelocity.add(steering)
    
    // Apply velocity limits
    if (newVelocity.length() > agent.config.speed) {
      newVelocity.normalize().scale(agent.config.speed)
    }

    body.setVelocity(newVelocity.x, newVelocity.y)
  }

  // Update agent rotation to face movement direction
  private updateRotation(agent: EnemyAgent): void {
    const body = agent.sprite.body as Phaser.Physics.Arcade.Body
    const velocity = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y)
    
    if (velocity.length() > 10) {
      const targetRotation = Phaser.Math.Angle.Between(0, 0, velocity.x, velocity.y) + Math.PI / 2
      const currentRotation = agent.sprite.rotation
      
      let rotationDiff = Phaser.Math.Angle.ShortestBetween(
        Phaser.Math.RadToDeg(currentRotation),
        Phaser.Math.RadToDeg(targetRotation)
      )

      const maxRotation = agent.config.turnRate * (1/60) // Per frame at 60 FPS
      rotationDiff = Phaser.Math.Clamp(rotationDiff, -maxRotation * 180/Math.PI, maxRotation * 180/Math.PI)
      
      agent.sprite.rotation += rotationDiff * Math.PI / 180
    }
  }

  // Handle enemy firing
  private updateFiring(agent: EnemyAgent, time: number): void {
    if (!this.state.playerTarget || !this.state.enemyLasers) return
    if (time - agent.lastFireTime < agent.config.fireRate) return

    const position = new Phaser.Math.Vector2(agent.sprite.x, agent.sprite.y)
    const playerPos = new Phaser.Math.Vector2(this.state.playerTarget.x, this.state.playerTarget.y)
    const distance = position.distance(playerPos)

    // Only fire if within engagement range
    if (distance > agent.config.engagementDistance) return

    // Simple line-of-sight check against shields
    if (this.state.shieldManager && this.isLineBlockedByShields(position, playerPos)) {
      return
    }

    this.fireAtTarget(agent, playerPos, time)
  }

  // Check if line of sight is blocked by shields
  private isLineBlockedByShields(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): boolean {
    if (!this.state.shieldManager) return false

    // Sample points along the line
    const samples = 5
    for (let i = 1; i < samples; i++) {
      const t = i / samples
      const samplePoint = from.clone().lerp(to, t)
      
      const collision = this.state.shieldManager.getBlockingCollision(samplePoint, CollisionLayer.ENEMY_LASER)
      if (collision && collision.zone === 'BARRIER') {
        return true
      }
    }
    
    return false
  }

  // Fire laser at target
  private fireAtTarget(agent: EnemyAgent, targetPos: Phaser.Math.Vector2, time: number): void {
    if (!this.state.enemyLasers) return

    const position = new Phaser.Math.Vector2(agent.sprite.x, agent.sprite.y)
    const rotation = agent.sprite.rotation
    
    // Calculate forward vector and spawn position
    const forward = new Phaser.Math.Vector2(Math.sin(rotation), -Math.cos(rotation)).normalize()
    const noseOffset = (agent.sprite.displayHeight / 2) - 6
    const spawnX = position.x + forward.x * noseOffset
    const spawnY = position.y + forward.y * noseOffset

    // Create laser
    const laser = this.state.scene.add.sprite(spawnX, spawnY, 'enemy-laser')
    laser.setBlendMode(Phaser.BlendModes.ADD)
    laser.setDepth(9)
    this.state.scene.physics.add.existing(laser)
    laser.setData('createdAt', time)
    laser.setData('isEnemyLaser', true)
    laser.setData('collisionLayer', CollisionLayer.ENEMY_LASER)

    // Aim at player (direct aim, no lead prediction for simplicity)
    const aimDirection = targetPos.clone().subtract(position).normalize()
    const body = laser.body as Phaser.Physics.Arcade.Body
    const speed = 700
    body.setVelocity(aimDirection.x * speed, aimDirection.y * speed)

    // Orient laser
    laser.rotation = Phaser.Math.Angle.Between(0, 0, aimDirection.x, aimDirection.y) + Math.PI / 2

    this.state.enemyLasers.add(laser)
    agent.lastFireTime = time
  }

  // Get all active agents
  getActiveAgents(): EnemyAgent[] {
    return Array.from(this.state.agents.values()).filter(agent => agent.isActive)
  }

  // Get agent by sprite
  getAgentBySprite(sprite: Phaser.GameObjects.Sprite): EnemyAgent | null {
    const enemyId = sprite.getData('enemyId')
    return enemyId ? this.state.agents.get(enemyId) || null : null
  }

  // Get enemy count
  getEnemyCount(): number {
    return this.state.agents.size
  }

  // Set max enemy limit
  setMaxEnemies(max: number): void {
    this.state.maxEnemies = max
  }
}
