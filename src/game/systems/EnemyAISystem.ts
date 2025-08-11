// EnemyAISystem.ts
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
  STRAFE = 'STRAFE',
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
  sensorRange: number
  fovDegrees: number
  orbitRadius: number
  strafeSpeed: number
  losSampleCount: number
  perceptionRecheckMs: number
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
  lastPerceptionCheck: number
  perception: {
    hasLOS: boolean
    inFOV: boolean
    inRange: boolean
    lastSeenAt: Phaser.Math.Vector2 | null
    lastSeenTime: number
  }
  orbit: {
    direction: 1 | -1
    lastFlipTime: number
  }
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

// Default enemy configuration (rebalanced)
const DEFAULT_ENEMY_CONFIG: EnemyConfig = {
  speed: 180,                // was 120
  acceleration: 600,         // was 60
  drag: 40,                  // was 200 (linear drag)
  turnRate: Math.PI,         // 180 deg/sec
  engagementDistance: 400,
  minDistance: 140,
  maxDistance: 520,
  fireRate: 1200,            // 1.2s
  health: 1,
  maxHealth: 1,
  patrolRadius: 150,
  avoidanceRadius: 80,
  sensorRange: 700,
  fovDegrees: 140,
  orbitRadius: 260,
  strafeSpeed: 100,
  losSampleCount: 6,
  perceptionRecheckMs: 120
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

  // Predictive pursuit (arrive to predicted target)
  pursuit(
    position: Phaser.Math.Vector2,
    targetPos: Phaser.Math.Vector2,
    targetVel: Phaser.Math.Vector2,
    maxSpeed: number,
    leadScale = 0.6
  ): Phaser.Math.Vector2 {
    const toTarget = targetPos.clone().subtract(position)
    const lookAhead = Math.min(0.9, (toTarget.length() / Math.max(maxSpeed, 1)) * leadScale)
    const predicted = targetPos.clone().add(targetVel.clone().scale(lookAhead))
    return SteeringHelpers.arrive(position, predicted, maxSpeed, 100)
  },

  // Wander helper (compute a point on a circle and seek it)
  wander(position: Phaser.Math.Vector2, angle: number, radius: number, maxSpeed: number): Phaser.Math.Vector2 {
    const target = new Phaser.Math.Vector2(
      position.x + Math.cos(angle) * radius,
      position.y + Math.sin(angle) * radius
    )
    return SteeringHelpers.seek(position, target, maxSpeed)
  },

  // Avoid shield barriers
  avoidShields(
    position: Phaser.Math.Vector2,
    velocity: Phaser.Math.Vector2,
    shieldManager: ShieldMapManager,
    avoidanceRadius: number
  ): Phaser.Math.Vector2 {
    const blocking = shieldManager.getBlockingCollision(position, CollisionLayer.ENEMY_SHIP)
    if (!blocking || !blocking.zone) return new Phaser.Math.Vector2(0, 0)

    const shieldSystem = shieldManager.getShieldForStation(blocking.stationId)
    if (!shieldSystem) return new Phaser.Math.Vector2(0, 0)

    const shieldCenter = shieldSystem.getConfig().position
    const awayFromShield = position.clone().subtract(shieldCenter).normalize()
    return awayFromShield.scale(avoidanceRadius * 2)
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
    body.setMaxVelocity(enemyConfig.speed, enemyConfig.speed)

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
      lastPerceptionCheck: 0,
      perception: { hasLOS: false, inFOV: false, inRange: false, lastSeenAt: null, lastSeenTime: 0 },
      orbit: { direction: Math.random() > 0.5 ? 1 : -1, lastFlipTime: 0 },
      health: enemyConfig.health,
      isActive: true
    }

    this.state.agents.set(agentId, agent)
    return agent
  }

  // ---------- Convenience edge spawners ----------
  public spawnFromLeft(count: number = 3, padding: number = 50, jitter: number = 20): void {
    this.spawnFromEdge('left', count, padding, jitter)
  }

  public spawnFromRight(count: number = 3, padding: number = 50, jitter: number = 20): void {
    this.spawnFromEdge('right', count, padding, jitter)
  }

  public spawnFromTop(count: number = 3, padding: number = 50, jitter: number = 20): void {
    this.spawnFromEdge('top', count, padding, jitter)
  }

  public spawnFromBottom(count: number = 3, padding: number = 50, jitter: number = 20): void {
    this.spawnFromEdge('bottom', count, padding, jitter)
  }

  private spawnFromEdge(
    edge: 'left' | 'right' | 'top' | 'bottom',
    count: number,
    padding: number,
    jitter: number
  ): void {
    const w = this.state.scene.scale.width
    const h = this.state.scene.scale.height
    const toSpawn = Math.min(count, Math.max(0, this.state.maxEnemies - this.state.agents.size))
    if (toSpawn <= 0) return

    const center = new Phaser.Math.Vector2(w / 2, h / 2)
    const target = this.state.playerTarget
      ? new Phaser.Math.Vector2(this.state.playerTarget.x, this.state.playerTarget.y)
      : center

    const rand = (r: number) => Phaser.Math.FloatBetween(-r, r)

    for (let i = 0; i < toSpawn; i++) {
      let x = 0, y = 0

      if (edge === 'left' || edge === 'right') {
        const step = (h - padding * 2) / (toSpawn + 1)
        y = padding + (i + 1) * step + rand(jitter)
        x = edge === 'left' ? padding : w - padding
      } else {
        const step = (w - padding * 2) / (toSpawn + 1)
        x = padding + (i + 1) * step + rand(jitter)
        y = edge === 'top' ? padding : h - padding
      }

      const agent = this.createEnemy(x, y)
      const ang = Phaser.Math.Angle.Between(x, y, target.x, target.y)
      agent.sprite.setRotation(ang + Math.PI / 2)
    }
  }
  // ---------- end spawners ----------

  // Spawn a ring-ish wave around screen center
  spawnWave(count: number = 3): void {
    if (!this.state.playerTarget) return

    const centerX = this.state.scene.scale.width / 2
    const centerY = this.state.scene.scale.height / 2

    for (let i = 0; i < count && this.state.agents.size < this.state.maxEnemies; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const spawnX = centerX + Math.cos(angle) * this.state.spawnRadius
      const spawnY = centerY + Math.sin(angle) * this.state.spawnRadius

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
    this.state.agents.forEach(agent => agent.sprite.destroy())
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

    // Refresh perception periodically
    this.updatePerception(agent, time)

    // Update behavior based on current state
    let desiredVelocity = this.updateBehavior(agent, position, time, delta)

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
        desiredVelocity = avoidance // strong avoidance overrides
        agent.lastAvoidanceTime = time
      }
    }

    // Blend station avoidance regardless of shield state (keeps enemies from cutting through stations)
    if (this.state.shieldManager) {
      const stationAvoid = this.computeStationAvoidance(position, agent.config.avoidanceRadius)
      if (stationAvoid.length() > 0) {
        desiredVelocity = desiredVelocity.add(stationAvoid)
      }
    }

    // Apply steering
    this.applySteering(agent, desiredVelocity, delta)

    // Update rotation to face movement direction (time-correct)
    this.updateRotation(agent, delta)

    // Handle firing
    this.updateFiring(agent, time)
  }

  // Update agent behavior based on state
  private updateBehavior(
    agent: EnemyAgent,
    position: Phaser.Math.Vector2,
    _time: number,
    delta: number
  ): Phaser.Math.Vector2 {
    if (!this.state.playerTarget) return new Phaser.Math.Vector2(0, 0)

    const playerPos = new Phaser.Math.Vector2(this.state.playerTarget.x, this.state.playerTarget.y)
    const distanceToPlayer = position.distance(playerPos)

    // State transitions
    if (distanceToPlayer < agent.config.minDistance) {
      agent.behavior = BehaviorState.EVADE
    } else if (agent.perception.hasLOS && distanceToPlayer >= agent.config.minDistance && distanceToPlayer <= agent.config.maxDistance) {
      agent.behavior = BehaviorState.STRAFE
    } else if (distanceToPlayer > agent.config.maxDistance) {
      agent.behavior = BehaviorState.SEEK
    } else {
      agent.behavior = BehaviorState.PATROL
    }

    // Execute behavior
    switch (agent.behavior) {
      case BehaviorState.PATROL: {
        // Advance patrol angle using real time
        agent.patrolAngle += 0.5 * (delta / 1000)
        const wanderTarget = new Phaser.Math.Vector2(
          agent.patrolCenter.x + Math.cos(agent.patrolAngle) * agent.config.patrolRadius,
          agent.patrolCenter.y + Math.sin(agent.patrolAngle) * agent.config.patrolRadius
        )
        return SteeringHelpers.arrive(position, wanderTarget, agent.config.speed * 0.6, 80)
      }

      case BehaviorState.SEEK: {
        // Predictive pursuit
        const pv = new Phaser.Math.Vector2(
          (this.state.playerTarget?.body as Phaser.Physics.Arcade.Body)?.velocity.x || 0,
          (this.state.playerTarget?.body as Phaser.Physics.Arcade.Body)?.velocity.y || 0
        )
        return SteeringHelpers.pursuit(position, playerPos, pv, agent.config.speed)
      }

      case BehaviorState.STRAFE: {
        return this.computeOrbitVelocity(agent, position, playerPos)
      }

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

  // Update agent rotation to face movement direction (time-correct)
  private updateRotation(agent: EnemyAgent, delta: number): void {
    const body = agent.sprite.body as Phaser.Physics.Arcade.Body
    const velocity = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y)

    if (velocity.length() > 10) {
      const targetRotation = Phaser.Math.Angle.Between(0, 0, velocity.x, velocity.y) + Math.PI / 2
      const currentRotation = agent.sprite.rotation

      let rotationDiff = Phaser.Math.Angle.ShortestBetween(
        Phaser.Math.RadToDeg(currentRotation),
        Phaser.Math.RadToDeg(targetRotation)
      )

      const maxRotation = agent.config.turnRate * (delta / 1000) // radians this frame
      const maxRotationDeg = Phaser.Math.RadToDeg(maxRotation)
      rotationDiff = Phaser.Math.Clamp(rotationDiff, -maxRotationDeg, maxRotationDeg)

      agent.sprite.rotation += Phaser.Math.DegToRad(rotationDiff)
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

    // Require LOS from perception
    if (!agent.perception.hasLOS) return

    this.fireAtTarget(agent, playerPos, time)
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

    // Lead prediction (single-step)
    const playerVel = new Phaser.Math.Vector2(
      (this.state.playerTarget?.body as Phaser.Physics.Arcade.Body)?.velocity.x || 0,
      (this.state.playerTarget?.body as Phaser.Physics.Arcade.Body)?.velocity.y || 0
    )
    const projectileSpeed = 700
    const toTarget = targetPos.clone().subtract(position)
    const travelTime = toTarget.length() / projectileSpeed
    const leadPos = targetPos.clone().add(playerVel.clone().scale(travelTime))

    const aimDirection = leadPos.clone().subtract(position).normalize()
    const body = laser.body as Phaser.Physics.Arcade.Body
    const speed = projectileSpeed
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
    return enemyId ? (this.state.agents.get(enemyId) || null) : null
  }

  // Get enemy count
  getEnemyCount(): number {
    return this.state.agents.size
  }

  // Set max enemy limit
  setMaxEnemies(max: number): void {
    this.state.maxEnemies = max
  }

  // Perception with LOS fallback (works even without ShieldManager)
  private updatePerception(agent: EnemyAgent, time: number): void {
    if (!this.state.playerTarget) return
    const cfg = agent.config
    const playerPos = new Phaser.Math.Vector2(this.state.playerTarget.x, this.state.playerTarget.y)
    const enemyPos = new Phaser.Math.Vector2(agent.sprite.x, agent.sprite.y)

    // Range
    const distance = enemyPos.distance(playerPos)
    agent.perception.inRange = distance <= cfg.sensorRange

    // FOV
    const toPlayer = playerPos.clone().subtract(enemyPos)
    const facing = new Phaser.Math.Vector2(Math.sin(agent.sprite.rotation), -Math.cos(agent.sprite.rotation))
    const cosAngle = Phaser.Math.Clamp(facing.dot(toPlayer.clone().normalize()), -1, 1)
    const angleDeg = Phaser.Math.RadToDeg(Math.acos(cosAngle))
    agent.perception.inFOV = angleDeg <= cfg.fovDegrees * 0.5

    // Throttle LOS checks
    const needsLOS = time - agent.lastPerceptionCheck >= cfg.perceptionRecheckMs
    if (needsLOS) {
      agent.lastPerceptionCheck = time
      if (this.state.shieldManager && agent.perception.inRange) {
        agent.perception.hasLOS = !this.isLineBlockedByShieldsWithSamples(
          enemyPos, playerPos, cfg.losSampleCount
        )
      } else {
        // No shield system: treat LOS as true when in range
        agent.perception.hasLOS = agent.perception.inRange
      }
    }

    if (agent.perception.hasLOS) {
      agent.perception.lastSeenAt = playerPos
      agent.perception.lastSeenTime = time
    }
  }

  private isLineBlockedByShieldsWithSamples(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2, samples: number): boolean {
    if (!this.state.shieldManager) return false
    const count = Math.max(3, samples)
    for (let i = 1; i < count; i++) {
      const t = i / count
      const p = from.clone().lerp(to, t)
      const collision = this.state.shieldManager.getBlockingCollision(p, CollisionLayer.ENEMY_LASER)
      if (collision && collision.zone === 'BARRIER') return true
    }
    return false
  }

  private computeOrbitVelocity(agent: EnemyAgent, position: Phaser.Math.Vector2, playerPos: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const cfg = agent.config
    const toPlayer = playerPos.clone().subtract(position)
    const distance = toPlayer.length()
    if (distance < 1) return new Phaser.Math.Vector2(0, 0)

    // Tangential (orbit) direction
    const radial = toPlayer.clone().normalize()
    const tangent = new Phaser.Math.Vector2(-radial.y, radial.x).scale(agent.orbit.direction)

    // Blend: keep on ring (arrive to orbit radius) + strafe around
    const ringTarget = radial.scale(Math.max(cfg.orbitRadius, 1)).add(playerPos)
    const arrive = SteeringHelpers.arrive(position, ringTarget, cfg.speed, cfg.minDistance)
    const strafe = tangent.clone().scale(cfg.strafeSpeed)

    // Occasionally flip orbit direction to avoid predictability
    if (this.state.playerTarget) {
      const now = this.state.scene.time.now
      if (now - agent.orbit.lastFlipTime > 2500 && Math.random() < 0.05) {
        agent.orbit.direction = agent.orbit.direction === 1 ? -1 : 1
        agent.orbit.lastFlipTime = now
      }
    }

    return arrive.add(strafe)
  }

  // Compute repulsive steering away from registered station occluders (LOS proxies)
  private computeStationAvoidance(position: Phaser.Math.Vector2, baseRadius: number): Phaser.Math.Vector2 {
    if (!this.state.shieldManager) return new Phaser.Math.Vector2(0, 0)
    const occluders = this.state.shieldManager.getStationOccluders()
    if (!occluders || occluders.length === 0) return new Phaser.Math.Vector2(0, 0)

    const avoidance = new Phaser.Math.Vector2(0, 0)
    for (const occ of occluders) {
      const away = position.clone().subtract(occ.position)
      const distance = away.length()
      const avoidRadius = occ.radius + baseRadius
      if (distance <= avoidRadius && distance > 0.0001) {
        const strength = Phaser.Math.Clamp((avoidRadius - distance) / avoidRadius, 0, 1)
        avoidance.add(away.normalize().scale(strength * baseRadius * 2))
      }
    }
    return avoidance
  }


}
