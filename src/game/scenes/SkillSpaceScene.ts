import Phaser from 'phaser'
import gameEventBridge from '../GameEventBridge'
import { createPlayer, updatePlayerVelocity, preloadPlayerAssets, findNearestObject } from '../systems/PlayerSystem'
import { spaceStationConfigs, getStationConfig, stationColorPalette } from '@/assets/images/space-stations/station-data'
import { getColorTint } from '@/assets/images/space-stations/sprite-map-config'

// Types for scene state
interface SceneState {
  player: Phaser.GameObjects.Sprite | null
  spaceStations: Phaser.GameObjects.Group | null
  portals: Phaser.GameObjects.Group | null
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null
  interactionPrompt: Phaser.GameObjects.Text | null
  healthText: Phaser.GameObjects.Text | null
  nearestStation: Phaser.GameObjects.GameObject | null
  nearestPortal: Phaser.GameObjects.GameObject | null
  isDocking: boolean
  isDocked: boolean
  dockedStation: Phaser.GameObjects.GameObject | null
  isModalOpen: boolean
  enemies: Phaser.GameObjects.Group | null
  lasers: Phaser.GameObjects.Group | null
  laserTimer: Phaser.Time.TimerEvent | null
  enemyLasers: Phaser.GameObjects.Group | null
  enemyLaserTimer: Phaser.Time.TimerEvent | null
  playerHealth: number
  maxPlayerHealth: number
  isPlayerInvulnerable: boolean
  shields: Phaser.GameObjects.Group | null
}

interface SpaceStationData {
  id: string
  skillId: string
  name: string
  emoji: string
  x: number
  y: number
  category: string
  description?: string
  stationType: 'A' | 'B' | 'C' | 'D' | 'E'
  colorVariant: string
  sector: 'development' | 'infrastructure' | 'innovation'
}

interface ShieldConfig {
  radius: number
  health: number
  maxHealth: number
  color: number
  regenerationRate: number
  lastHitTime: number
  lastRegenTime: number
  isActive: boolean
  stationId: string
}

interface PortalData {
  id: string
  name: string
  targetScene: string
}

// Pure functions for scene logic - Space themed data
const createSpaceStationsData = (): SpaceStationData[] => [
  // DEVELOPMENT SECTOR (Western Quadrant)
  { 
    id: 'frontend-station', 
    skillId: 'frontend',
    name: 'Frontend Development\nStation', 
    emoji: '👨‍💻', 
    x: 1650, 
    y: 250, 
    category: 'frontend',
    stationType: 'A',
    colorVariant: 'blue',
    sector: 'development',
    description: 'Deep mastery of Vue.js, React, Angular. CSS3, HTML5, TailwindCSS wizard. Performance optimization expert.'
  },
  { 
    id: 'testing-station', 
    skillId: 'testing',
    name: 'Testing Systems\nPlatform', 
    emoji: '🧪', 
    x: 320, 
    y: 780, 
    category: 'testing',
    stationType: 'A',
    colorVariant: 'green',
    sector: 'development',
    description: 'Cypress ninja, Jest, Mocha, Chai master. Writes resilient full-coverage tests.'
  },
  { 
    id: 'architecture-station', 
    skillId: 'architecture',
    name: 'Architecture\nHub', 
    emoji: '📦', 
    x: 1420, 
    y: 880, 
    category: 'architecture',
    stationType: 'B',
    colorVariant: 'orange',
    sector: 'development',
    description: 'Vuex wizard, Supabase integration. Large-scale app architecture at EA, Dell, RentPath.'
  },
  
  // INFRASTRUCTURE SECTOR (Eastern Quadrant)
  { 
    id: 'tooling-station', 
    skillId: 'tooling',
    name: 'Tooling\nPlatform', 
    emoji: '⚙️', 
    x: 220, 
    y: 380, 
    category: 'tooling',
    stationType: 'C',
    colorVariant: 'purple',
    sector: 'infrastructure',
    description: 'Vite, Webpack, TypeScript expert. Custom component libraries and mono repos.'
  },
  { 
    id: 'devops-station', 
    skillId: 'devops',
    name: 'DevOps\nCommand', 
    emoji: '📡', 
    x: 1000, 
    y: 820, 
    category: 'devops',
    stationType: 'E',
    colorVariant: 'red',
    sector: 'infrastructure',
    description: 'Git mastery, CIDR, VLANs, merge automation. Network knowledge from dev perspective.'
  },
  { 
    id: 'security-station', 
    skillId: 'security',
    name: 'Security\nFortress', 
    emoji: '🔒', 
    x: 850, 
    y: 520, 
    category: 'security',
    stationType: 'B',
    colorVariant: 'gray',
    sector: 'infrastructure',
    description: 'Linux Foundation certified (LFD121). Security and accessibility by design, not bolted on.'
  },
  
  // INNOVATION HUB (Northern Command Center)
  { 
    id: 'ai-station', 
    skillId: 'ai',
    name: 'AI Research\nStation', 
    emoji: '🧠', 
    x: 580, 
    y: 320, 
    category: 'ai',
    stationType: 'D',
    colorVariant: 'cyan',
    sector: 'innovation',
    description: 'Custom RAG systems with similarity search. LLM integration in production workflows.'
  },
  { 
    id: 'leadership-station', 
    skillId: 'leadership',
    name: 'Leadership\nCenter', 
    emoji: '🎤', 
    x: 1120, 
    y: 300, 
    category: 'leadership',
    stationType: 'C',
    colorVariant: 'gold',
    sector: 'innovation',
    description: 'Google Tech Talk speaker. Published "Pro HTML5 Performance" by Apress. UI badass.'
  }
]

const createPortalsData = (width: number, height: number): Array<PortalData & { x: number; y: number; color: number; emoji: string }> => [
  {
    id: 'forest',
    name: 'Project Forest',
    targetScene: 'ProjectForestScene',
    x: 50,
    y: height / 2,
    color: 0x27ae60,
    emoji: '🌲'
  },
  {
    id: 'tower',
    name: 'Résumé Tower',
    targetScene: 'ResumeTowerScene',
    x: width - 50,
    y: height / 2,
    color: 0x8e44ad,
    emoji: '🏰'
  }
]

// Factory functions for creating game objects

// Map skill IDs to specific starbase images
const getStarbaseImage = (skillId: string): string => {
  const starbaseMapping: Record<string, string> = {
    'frontend': 'starbase1',
    'testing': 'starbase2', 
    'architecture': 'starbase3',
    'tooling': 'starbase4',
    'devops': 'starbase5',
    'security': 'starbase6',
    'ai': 'starbase7',
    'leadership': 'starbase8'
  }
  
  return starbaseMapping[skillId] || 'starbase1' // Default fallback
}

const createSpaceStation = (scene: Phaser.Scene, station: SpaceStationData, onInteract: (stationId: string) => void): Phaser.GameObjects.Container => {
  const stationContainer = scene.add.container(station.x, station.y)
  
  let stationBody: Phaser.GameObjects.Image | Phaser.GameObjects.Shape
  
  // Get the appropriate starbase image for this station
  const starbaseKey = getStarbaseImage(station.skillId)
  
  console.log(`🔍 Creating station ${station.skillId} using ${starbaseKey}`)
  
  // Use individual starbase images
  if (scene.textures.exists(starbaseKey)) {
    console.log(`✅ Using ${starbaseKey} for ${station.skillId} station`)
    
    // Create sprite from individual starbase image
    stationBody = scene.add.image(0, 0, starbaseKey)
    stationBody.setDisplaySize(120, 120) // Scale to a good visible size
    
    // Apply color tint for category identification
    const colorTint = getColorTint(station.colorVariant)
    stationBody.setTint(colorTint)
    
    console.log(`✅ Created starbase station: ${station.skillId} using ${starbaseKey} with tint: ${colorTint.toString(16)}`)
  } else {
    // Fallback to geometric shape  
    console.warn(`Starbase image ${starbaseKey} not found for station ${station.skillId}, using fallback`)
    
    const stationColor = stationColorPalette[station.colorVariant as keyof typeof stationColorPalette]
    
    switch (station.stationType) {
      case 'A': // Compact research module
        stationBody = scene.add.rectangle(0, 0, 70, 50, Phaser.Display.Color.HexStringToColor(stationColor).color, 0.9)
        break
      case 'B': // Industrial platform  
        stationBody = scene.add.rectangle(0, 0, 80, 40, Phaser.Display.Color.HexStringToColor(stationColor).color, 0.9)
        break
      case 'C': // Large hub station
        stationBody = scene.add.circle(0, 0, 35, Phaser.Display.Color.HexStringToColor(stationColor).color, 0.9)
        break
      case 'D': // Specialized research (hexagonal)
        stationBody = scene.add.polygon(0, 0, [
          [-25, 0], [-12, -22], [12, -22], [25, 0], [12, 22], [-12, 22]
        ], Phaser.Display.Color.HexStringToColor(stationColor).color, 0.9)
        break
      case 'E': // Command station
        stationBody = scene.add.rectangle(0, 0, 75, 45, Phaser.Display.Color.HexStringToColor(stationColor).color, 0.9)
        break
      default:
        stationBody = scene.add.rectangle(0, 0, 60, 50, Phaser.Display.Color.HexStringToColor(stationColor).color, 0.9)
    }
    
    if ('setStrokeStyle' in stationBody) {
      stationBody.setStrokeStyle(3, 0x34495E)
    }
  }
  
  // Station identifier removed - starbase images are detailed enough
  
  // Station label positioned below starbase - clean, no background
  const stationLabel = scene.add.text(0, 95, station.name, { 
    fontSize: '18px', 
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    fontStyle: 'bold',
    color: '#FFFFFF',
    align: 'center',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5)

  // Status indicator - gentle pulsing effect
  const statusIndicator = scene.add.circle(25, -25, 4, 0x00FF88, 0.8)
  scene.tweens.add({
    targets: statusIndicator,
    alpha: { from: 0.4, to: 1 },
    scale: { from: 0.8, to: 1.2 },
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })

  // Docking indicators (subtle industrial details)
  const dockingPort1 = scene.add.rectangle(-30, 0, 6, 3, 0x95A5A6)
  const dockingPort2 = scene.add.rectangle(30, 0, 6, 3, 0x95A5A6)

  stationContainer.add([stationBody, stationLabel, statusIndicator, dockingPort1, dockingPort2])
  
  stationContainer.setData('stationData', station)
  stationContainer.setData('isStation', true)
  stationContainer.setSize(80, 80)
  stationContainer.setInteractive()
  stationContainer.on('pointerdown', () => onInteract(station.skillId))
  
  return stationContainer
}

const createPortal = (
  scene: Phaser.Scene, 
  portalData: PortalData & { x: number; y: number; color: number; emoji: string },
  onActivate: (sceneName: string) => void
): Phaser.GameObjects.Container => {
  const portal = scene.add.container(portalData.x, portalData.y)
  
  portal.add([
    scene.add.rectangle(0, 0, 60, 80, portalData.color, 0.7),
    scene.add.text(0, -10, portalData.emoji, { fontSize: '24px' }).setOrigin(0.5),
    scene.add.text(0, 15, portalData.name.replace(' ', '\n'), { 
      fontSize: '10px', 
      align: 'center', 
      color: '#ffffff' 
    }).setOrigin(0.5)
  ])
  
  scene.physics.add.existing(portal, true)
  portal.setData('portalData', { 
    id: portalData.id, 
    name: portalData.name, 
    targetScene: portalData.targetScene 
  })
  portal.setData('isPortal', true)
  portal.setSize(60, 80)
  portal.setInteractive()
  portal.on('pointerdown', () => {
    onActivate(portalData.targetScene)
  })
  
  return portal
}

const setupSpaceBackground = (scene: Phaser.Scene): void => {
  const { width, height } = scene.scale

  // Deep space background
  scene.add.rectangle(width / 2, height / 2, width, height, 0x0A0A1F, 1.0)
  
  // Add starfield
  for (let i = 0; i < 100; i++) {
    const x = Phaser.Math.Between(0, width)
    const y = Phaser.Math.Between(0, height)
    const starSize = Phaser.Math.Between(1, 3)
    const star = scene.add.circle(x, y, starSize, 0xFFFFFF, Phaser.Math.FloatBetween(0.3, 0.9))
  }
  
  // Scene title with space theme
  scene.add.text(width / 2, 60, '🚀 Skills Command Center', {
    fontSize: '32px',
    color: '#ECF0F1',
    fontStyle: 'bold'
  }).setOrigin(0.5)

  scene.add.text(width / 2, 120, 'Navigate to different stations to explore technical expertise', {
    fontSize: '18px',
    color: '#BDC3C7'
  }).setOrigin(0.5)

  // Sector labels - enhanced antialiasing
  scene.add.text(200, 180, 'DEVELOPMENT SECTOR', {
    fontSize: '20px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    color: '#3498DB',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 2
  }).setOrigin(0.5)

  scene.add.text(800, 180, 'INFRASTRUCTURE SECTOR', {
    fontSize: '20px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    color: '#E74C3C',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 2
  }).setOrigin(0.5)

  scene.add.text(500, 120, 'INNOVATION HUB', {
    fontSize: '20px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    color: '#F39C12',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 2
  }).setOrigin(0.5)
}

// Utility to generate a simple glowing laser texture if not already present
const ensureLaserTexture = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('laser-beam')) return
  const g = scene.add.graphics({ x: 0, y: 0 })
  g.clear()
  g.fillStyle(0x00ffff, 1)
  g.fillRoundedRect(0, 0, 6, 28, 3)
  g.generateTexture('laser-beam', 6, 28)
  g.destroy()
}

// Utility to generate an enemy laser texture (red) if not present
const ensureEnemyLaserTexture = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('enemy-laser')) return
  const g = scene.add.graphics({ x: 0, y: 0 })
  g.clear()
  g.fillStyle(0xff4d3a, 1)
  g.fillRoundedRect(0, 0, 6, 28, 3)
  g.generateTexture('enemy-laser', 6, 28)
  g.destroy()
}

// Shield system functions
const createShieldTexture = (scene: Phaser.Scene, color: number, state: 'healthy' | 'damaged' | 'critical'): string => {
  const textureKey = `shield-${state}-${color.toString(16)}`
  if (scene.textures.exists(textureKey)) return textureKey

  const size = 240
  const g = scene.add.graphics({ x: 0, y: 0 })
  g.clear()

  // Create gradient effect based on shield state
  let alpha = 0.3
  let innerAlpha = 0.1
  
  switch (state) {
    case 'healthy':
      alpha = 0.3
      innerAlpha = 0.1
      break
    case 'damaged':
      alpha = 0.4
      innerAlpha = 0.15
      color = 0xFFAA00 // Yellow tint
      break
    case 'critical':
      alpha = 0.5
      innerAlpha = 0.2
      color = 0xFF4400 // Red tint
      break
  }

  // Outer ring (stronger visibility)
  g.fillStyle(color, alpha)
  g.fillCircle(size / 2, size / 2, size / 2)
  
  // Inner fill (more subtle)
  g.fillStyle(color, innerAlpha)
  g.fillCircle(size / 2, size / 2, (size / 2) - 4)
  
  // Energy ripple effect
  for (let i = 0; i < 3; i++) {
    const rippleRadius = (size / 2) - (i * 15) - 10
    if (rippleRadius > 0) {
      g.lineStyle(2, color, alpha * 0.8)
      g.strokeCircle(size / 2, size / 2, rippleRadius)
    }
  }

  g.generateTexture(textureKey, size, size)
  g.destroy()
  
  return textureKey
}

const getShieldConfigForStation = (station: SpaceStationData): Omit<ShieldConfig, 'health' | 'lastHitTime' | 'lastRegenTime' | 'isActive' | 'stationId'> => {
  // Uniform shield behavior for all stations (match frontend station)
  return {
    radius: 90,
    maxHealth: 4,
    color: 0x00AAFF,
    regenerationRate: 2000
  }
}

const createStationShield = (scene: Phaser.Scene, station: SpaceStationData, x: number, y: number): Phaser.GameObjects.Container => {
  const baseConfig = getShieldConfigForStation(station)
  const shieldConfig: ShieldConfig = {
    ...baseConfig,
    health: baseConfig.maxHealth,
    lastHitTime: 0,
    lastRegenTime: 0,
    isActive: true,
    stationId: station.id
  }

  const shieldContainer = scene.add.container(x, y)
  
  // Create shield visual
  const healthyTexture = createShieldTexture(scene, baseConfig.color, 'healthy')
  const shieldSprite = scene.add.image(0, 0, healthyTexture)
  shieldSprite.setDisplaySize(baseConfig.radius * 2, baseConfig.radius * 2)
  shieldSprite.setDepth(2) // Above stations but below player
  
  // Add subtle pulse animation
  scene.tweens.add({
    targets: shieldSprite,
    scaleX: { from: 0.98, to: 1.02 },
    scaleY: { from: 0.98, to: 1.02 },
    duration: 3000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })

  shieldContainer.add(shieldSprite)
  
  // Store shield configuration
  shieldContainer.setData('shieldConfig', shieldConfig)
  shieldContainer.setData('isShield', true)
  shieldContainer.setData('shieldSprite', shieldSprite)
  
  // Debug label with health above the shield
  const debugLabel = scene.add.text(0, -baseConfig.radius - 18, `${station.id}: ${shieldConfig.health}/${shieldConfig.maxHealth}`, {
    fontSize: '12px',
    color: '#ecf0f1',
    backgroundColor: '#2c3e50aa',
    padding: { x: 6, y: 3 }
  }).setOrigin(0.5)
  debugLabel.setDepth(3)
  shieldContainer.add(debugLabel)
  shieldContainer.setData('shieldLabel', debugLabel)
  
  // Setup physics body for collision detection
  scene.physics.add.existing(shieldContainer, true) // Static body
  const body = shieldContainer.body as Phaser.Physics.Arcade.StaticBody
  body.setCircle(baseConfig.radius, -baseConfig.radius, -baseConfig.radius)
  
  return shieldContainer
}

/**
 * Skills Space Scene - Interactive space command center showcasing technical skills
 * Space stations represent different skill categories in organized sectors
 */
export class SkillSpaceScene extends Phaser.Scene {
  private static readonly PLAYER_MAX_HEALTH = 3
  private static readonly PLAYER_INVULNERABILITY_MS = 800

  private state: SceneState = {
    player: null,
    spaceStations: null,
    portals: null,
    cursors: null,
    interactionPrompt: null,
    healthText: null,
    nearestStation: null,
    nearestPortal: null,
    isDocking: false,
    isDocked: false,
    dockedStation: null,
    isModalOpen: false,
    enemies: null,
    lasers: null,
    laserTimer: null,
    enemyLasers: null,
    enemyLaserTimer: null,
    playerHealth: SkillSpaceScene.PLAYER_MAX_HEALTH,
    maxPlayerHealth: SkillSpaceScene.PLAYER_MAX_HEALTH,
    isPlayerInvulnerable: false,
    shields: null
  }

  constructor() {
    super({ key: 'SkillSpaceScene' })
  }

  preload(): void {
    preloadPlayerAssets(this)
    
    // Load individual starbase images
    console.log('🔄 Preloading individual starbase images...')
    
    for (let i = 1; i <= 11; i++) {
      this.load.image(`starbase${i}`, `starbase${i}.png`)
    }

    // Load enemy ship asset
    this.load.image('enemy-ship', 'src/assets/images/enemy-ship.png')

    // Load explosion sprite (note: file name is intentionally spelled as in asset path)
    this.load.image('enemy-explosion', 'src/assets/images/emeny-explode.png')

    // Load hero explosion sprite
    this.load.image('hero-explosion', 'src/assets/images/HeroShipExplodes.png')
    
    // Add load event listeners for debugging
    this.load.on('filecomplete', (key: string) => {
      if (key.startsWith('starbase')) {
        console.log(`✅ ${key} loaded successfully!`)
      }
      if (key === 'enemy-ship') {
        console.log('✅ enemy-ship loaded successfully!')
      }
      if (key === 'enemy-explosion') {
        console.log('✅ enemy-explosion loaded successfully!')
      }
      if (key === 'hero-explosion') {
        console.log('✅ hero-explosion loaded successfully!')
      }
    })
    
    this.load.on('loaderror', (file: any) => {
      console.error('❌ Failed to load:', file.key, file.src)
    })
    
    console.log('🔄 Starbase image loading setup complete')
  }

  create(): void {
    // Initialize scene using functional approach
    this.initializeScene()
    
    // Setup modal event listeners
    this.setupModalEventListeners()
    
    // Global click detection
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Click detection for debugging if needed
    })
    
    // Mouse movement tracking  
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Mouse movement tracking for debugging if needed
    })
    
    // Start this scene as the initial scene
    this.scene.setActive(true)
  }

  private initializeScene(): void {
    const { width, height } = this.scale
     
    // Setup space background
    setupSpaceBackground(this)
    
    // Create player - start on right side, vertically centered
    this.state.player = createPlayer(this, width - 150, height / 2)
    // Set player depth to appear above other objects
    this.state.player.setDepth(10)

    // Prepare laser assets/group
    ensureLaserTexture(this)
    this.state.lasers = this.add.group()

    // Enemy lasers
    ensureEnemyLaserTexture(this)
    this.state.enemyLasers = this.add.group()

    // Create enemies group and a starter enemy
    this.state.enemies = this.add.group()
    const enemyOffset = 250
    const enemyX = Math.max(100, (this.state.player as Phaser.GameObjects.Sprite).x - enemyOffset)
    const enemyY = (this.state.player as Phaser.GameObjects.Sprite).y
    const enemy = this.add.sprite(enemyX, enemyY, 'enemy-ship')
    enemy.setDisplaySize(96, 96)
    this.physics.add.existing(enemy)
    enemy.setDepth(5)
    enemy.setRotation(Math.PI / 2) // face right, toward the hero who faces left
    enemy.setData('isEnemy', true)
    this.state.enemies.add(enemy)

    // Enemy periodic firing
    this.state.enemyLaserTimer = this.time.addEvent({ delay: 800, loop: true, callback: () => this.fireEnemyLaserAtPlayer() })
    
    // Lasers are fired manually when SPACE is held
    
    // Create space stations
    this.state.spaceStations = this.add.group()
    const stations = createSpaceStationsData()
    stations.forEach(station => {
      const stationObject = createSpaceStation(this, station, this.handleStationInteraction)
      // Set stations to lower depth so player appears above them
      stationObject.setDepth(1)
      this.state.spaceStations!.add(stationObject)
    })
    
    // Create shields for each station
    this.state.shields = this.add.group()
    stations.forEach(station => {
      const shield = createStationShield(this, station, station.x, station.y)
      this.state.shields!.add(shield)
    })

    // Initial debug: damage all shields by 1 so regen is observable
    this.time.delayedCall(500, () => {
      if (!this.state.shields) return
      this.state.shields.children.each((obj: Phaser.GameObjects.GameObject) => {
        const shield = obj as Phaser.GameObjects.Container
        const cfg = shield.getData('shieldConfig') as ShieldConfig
        if (!cfg) return null
        this.damageShield(shield, 1)
        return null
      }, this)
    })

    // Periodic debug log of shield states
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.state.shields) return
        const snapshot: Array<{ id: string; hp: number; max: number; active: boolean; sinceHitMs: number }> = []
        const now = this.time.now
        this.state.shields.children.each((obj: Phaser.GameObjects.GameObject) => {
          const shield = obj as Phaser.GameObjects.Container
          const cfg = shield.getData('shieldConfig') as ShieldConfig
          if (!cfg) return null
          snapshot.push({ id: cfg.stationId, hp: cfg.health, max: cfg.maxHealth, active: cfg.isActive, sinceHitMs: now - (cfg.lastHitTime || 0) })
          const label = shield.getData('shieldLabel') as Phaser.GameObjects.Text
          if (label) {
            label.setText(`${cfg.stationId}: ${cfg.health}/${cfg.maxHealth}${cfg.isActive ? '' : ' (down)'}`)
          }
          return null
        }, this)
        // eslint-disable-next-line no-console
        console.log('[ShieldDebug]', JSON.stringify(snapshot))
      }
    })
    
    // Setup controls
    this.setupControls()
    
    // Create UI elements
    this.setupUI()
    
    // Create portals
    this.state.portals = this.add.group()
    const portalsData = createPortalsData(width, height)
    portalsData.forEach(portalData => {
      const portal = createPortal(this, portalData, this.handleSceneTransition)
      this.state.portals!.add(portal)
    })

    // Laser vs Enemy collision detection
    if (this.state.lasers && this.state.enemies) {
      this.physics.add.overlap(
        this.state.lasers,
        this.state.enemies,
        this.handleLaserEnemyOverlap as unknown as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      )
    }

    // Enemy laser vs Player collision detection
    if (this.state.enemyLasers && this.state.player) {
      this.physics.add.overlap(
        this.state.enemyLasers,
        this.state.player,
        this.handleEnemyLaserHitPlayer as unknown as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      )
    }

    // Shield collision detection - lasers hit shields
    if (this.state.shields) {
      // Player lasers vs shields
      if (this.state.lasers) {
        this.physics.add.overlap(
          this.state.lasers,
          this.state.shields,
          this.handleLaserShieldHit as unknown as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
          undefined,
          this
        )
      }
      
      // Enemy lasers vs shields
      if (this.state.enemyLasers) {
        this.physics.add.overlap(
          this.state.enemyLasers,
          this.state.shields,
          this.handleLaserShieldHit as unknown as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
          undefined,
          this
        )
      }
    }
  }

  // Handler methods for interactions
  private dockWithStation = (station: Phaser.GameObjects.GameObject, skillId: string): void => {
    if (!this.state.player || this.state.isDocking) return
    
    this.state.isDocking = true
    
    // Get station position
    const stationX = (station as any).x
    const stationY = (station as any).y
    
    // Update interaction prompt
    if (this.state.interactionPrompt) {
      this.state.interactionPrompt.setText('Docking...')
    }
    
    // Animate ship to station center
    this.tweens.add({
      targets: this.state.player,
      x: stationX,
      y: stationY,
      duration: 800,
      ease: 'Power2.easeInOut',
      onComplete: () => {
        // Station docking animation
        this.tweens.add({
          targets: station,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          yoyo: true,
          ease: 'Power2',
          onComplete: () => {
            // Complete docking sequence
            this.state.isDocking = false
            this.state.isDocked = true
            this.state.dockedStation = station
            
            if (this.state.interactionPrompt) {
              this.state.interactionPrompt.setText('Docked! Press SPACE to undock')
              this.state.interactionPrompt.setVisible(true)
            }
            
            // Emit skill selected event
            gameEventBridge.emitGameEvent('game:skill-selected', { skillId })
          }
        })
      }
    })
  }

  private undockFromStation = (): void => {
    if (!this.state.player || !this.state.isDocked) return
    
    this.state.isDocked = false
    this.state.dockedStation = null
    
    if (this.state.interactionPrompt) {
      this.state.interactionPrompt.setVisible(false)
    }
  }

  private handleStationInteraction = (skillId: string): void => {
    gameEventBridge.emitGameEvent('game:skill-selected', { skillId })
  }

  private handleSceneTransition = (sceneName: string): void => {
    gameEventBridge.emitGameEvent('game:scene-starting', { sceneName })
    this.scene.start(sceneName)
  }

  private setupControls(): void {
    this.state.cursors = this.input.keyboard!.createCursorKeys()

    const keyD = this.input.keyboard!.addKey('D')
    const keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Laser hold-to-fire: SPACE down starts repeat; up stops
    keySpace.on('down', () => {
      if (this.state.laserTimer) {
        this.state.laserTimer.remove(false)
        this.state.laserTimer = null
      }
      this.fireLasersAtEnemy()
      this.state.laserTimer = this.time.addEvent({ delay: 140, loop: true, callback: () => this.fireLasersAtEnemy() })
    })

    keySpace.on('up', () => {
      if (this.state.laserTimer) {
        this.state.laserTimer.remove(false)
        this.state.laserTimer = null
      }
    })
    
    // D for docking/interaction
    keyD.on('down', () => {
      // Priority 1: Close modal and undock if modal is open
      if (this.state.isModalOpen) {
        gameEventBridge.emitGameEvent('ui:setting-changed', { key: 'closeModal', value: true })
        if (this.state.isDocked) {
          this.undockFromStation()
        }
        return
      }
      if (this.state.isDocking) return
      if (this.state.isDocked) {
        this.undockFromStation()
        return
      }
      if (this.state.nearestPortal) {
        const portalData = this.state.nearestPortal.getData('portalData')
        if (portalData) {
          this.handleSceneTransition(portalData.targetScene)
        }
      } else if (this.state.nearestStation) {
        const stationData = this.state.nearestStation.getData('stationData')
        if (stationData) {
          this.dockWithStation(this.state.nearestStation, stationData.skillId)
        }
      }
    })
  }

  private setupModalEventListeners(): void {
    // Listen for modal opened/closed events to track state
    gameEventBridge.onGameEvent('ui:modal-opened', () => {
      this.state.isModalOpen = true
    })

    gameEventBridge.onGameEvent('ui:modal-closed', () => {
      this.state.isModalOpen = false
    })
  }

  private setupUI(): void {
    // Interaction prompt with space theme
    this.state.interactionPrompt = this.add.text(
      this.scale.width / 2, 
      this.scale.height - 80, 
      '', 
      {
        fontSize: '18px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        fontStyle: 'bold',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2,
        backgroundColor: '#2C3E50ee',
        padding: { x: 12, y: 6 },
        resolution: 2
      }
    ).setOrigin(0.5).setVisible(false)

    // Navigation hints with space terminology
    this.add.text(20, this.scale.height - 60, 'WASD/Arrows: Navigate | SPACE: Fire lasers | D: Dock/Undock/Interact', {
      fontSize: '16px',
      color: '#95A5A6'
    })

    // Health display (top-left)
    this.state.healthText = this.add.text(24, 24, '', {
      fontSize: '22px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      fontStyle: 'bold',
      color: '#FF6B6B',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(100)
    this.updateHealthUI()
  }

  update(): void {
    if (!this.state.player || !this.state.cursors) return

    // Only allow movement if not docking or docked
    if (!this.state.isDocking && !this.state.isDocked) {
      // Handle player movement using functional approach
      updatePlayerVelocity(this.state.player, this.state.cursors, this.input.keyboard!)

      // Check for portal proximity
      this.updatePortalProximity()

      // Check for station proximity
      this.updateStationProximity()
    }

    // Cleanup lasers after lifetime
    if (this.state.lasers) {
      const now = this.time.now
      this.state.lasers.children.each((laserObj: Phaser.GameObjects.GameObject) => {
        const createdAt = laserObj.getData('createdAt') as number | undefined
        if (createdAt && now - createdAt > 2500) {
          laserObj.destroy()
        }
        return null
      }, this)
    }

    // Cleanup enemy lasers after lifetime
    if (this.state.enemyLasers) {
      const now = this.time.now
      this.state.enemyLasers.children.each((laserObj: Phaser.GameObjects.GameObject) => {
        const createdAt = laserObj.getData('createdAt') as number | undefined
        if (createdAt && now - createdAt > 2500) {
          laserObj.destroy()
        }
        return null
      }, this)
    }

    // Regenerate shields
    this.regenerateShields()
  }

  private updatePortalProximity(): void {
    if (!this.state.portals || !this.state.player || !this.state.interactionPrompt) return

    const portals = this.state.portals.children.entries as Phaser.GameObjects.GameObject[]
    const nearestPortal = findNearestObject(this.state.player, portals, 100)

    if (nearestPortal !== this.state.nearestPortal) {
      this.state.nearestPortal = nearestPortal
      
      if (this.state.nearestPortal) {
        const portalData = this.state.nearestPortal.getData('portalData')
        this.state.interactionPrompt.setText(`Press SPACE to travel to ${portalData.name}`)
        this.state.interactionPrompt.setVisible(true)
      } else if (!this.state.nearestStation) {
        this.state.interactionPrompt.setVisible(false)
      }
    }
  }

  private updateStationProximity(): void {
    if (!this.state.spaceStations || !this.state.player || !this.state.interactionPrompt || this.state.nearestPortal) return

    const stations = this.state.spaceStations.children.entries as Phaser.GameObjects.GameObject[]
    const nearestStation = findNearestObject(this.state.player, stations, 80)

    if (nearestStation !== this.state.nearestStation) {
      this.state.nearestStation = nearestStation
      
      if (this.state.nearestStation && !this.state.nearestPortal) {
        const stationData = this.state.nearestStation.getData('stationData')
        this.state.interactionPrompt.setText(`Press SPACE to dock with ${stationData.name.replace('\n', ' ')}`)
        this.state.interactionPrompt.setVisible(true)
      } else if (!this.state.nearestPortal) {
        this.state.interactionPrompt.setVisible(false)
      }
    }
  }

  private fireLasersAtEnemy = (): void => {
    if (!this.state.player) return

    const player = this.state.player

    const wingOffsetsLocal = [
      new Phaser.Math.Vector2(-18, 18),
      new Phaser.Math.Vector2(18, 18)
    ]

    const rotation = player.rotation

    // Forward vector for a sprite that faces up by default
    const forward = new Phaser.Math.Vector2(Math.sin(rotation), -Math.cos(rotation)).normalize()

    wingOffsetsLocal.forEach(offset => {
      const rotated = offset.clone().rotate(rotation)
      const spawnX = player.x + rotated.x
      const spawnY = player.y + rotated.y

      const laser = this.add.sprite(spawnX, spawnY, 'laser-beam')
      laser.setBlendMode(Phaser.BlendModes.ADD)
      laser.setDepth(9)
      this.physics.add.existing(laser)
      laser.setData('createdAt', this.time.now)

      const body = laser.body as Phaser.Physics.Arcade.Body
      body.setAllowRotation(true)

      const speed = 800
      body.setVelocity(forward.x * speed, forward.y * speed)

      // Align laser orientation with player's facing
      laser.rotation = rotation

      this.state.lasers!.add(laser)
    })
  }

  private handleLaserEnemyOverlap = (
    laserObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ): void => {
    const enemy = enemyObj as Phaser.GameObjects.Sprite
    const laser = laserObj as Phaser.GameObjects.Sprite
    if (!enemy || !laser) return
    if (enemy.getData('isDead')) return
    enemy.setData('isDead', true)

    this.spawnExplosionAt(enemy.x, enemy.y)

    enemy.destroy()
    laser.destroy()
  }

  private spawnExplosionAt = (x: number, y: number): void => {
    const explosion = this.add.image(x, y, 'enemy-explosion')
    explosion.setDepth(50)
    explosion.setBlendMode(Phaser.BlendModes.ADD)
    explosion.setDisplaySize(160, 160)
    explosion.setAlpha(0.9)

    this.tweens.add({
      targets: explosion,
      scale: { from: 0.1, to: 0.5 },
      alpha: { from: 1 , to: 0 },
      duration: 550,
      ease: 'Cubic.Out',
      onComplete: () => explosion.destroy()
    })
  }

  private spawnHeroExplosionAt = (x: number, y: number): void => {
    const explosion = this.add.image(x, y, 'hero-explosion')
    explosion.setDepth(50)
    explosion.setBlendMode(Phaser.BlendModes.ADD)
    explosion.setDisplaySize(180, 180)
    explosion.setAlpha(1)

    this.tweens.add({
      targets: explosion,
      scale: { from: 0.5, to: 1.0 },
      alpha: { from: 1, to: 0 },
      duration: 600,
      ease: 'Cubic.Out',
      onComplete: () => explosion.destroy()
    })
  }

  private fireEnemyLaserAtPlayer = (): void => {
    if (!this.state.player || !this.state.enemies || !this.state.enemyLasers) return
    const enemySprite = (this.state.enemies.children.entries[0] as Phaser.GameObjects.Sprite) || null
    if (!enemySprite) return

    // Spawn from the enemy's nose and fire straight ahead (enemy currently faces right)
    const rotation = enemySprite.rotation
    const forward = new Phaser.Math.Vector2(Math.sin(rotation), -Math.cos(rotation)).normalize()
    const noseOffset = (enemySprite.displayHeight / 2) - 6
    const spawnX = enemySprite.x + forward.x * noseOffset
    const spawnY = enemySprite.y + forward.y * noseOffset

    const laser = this.add.sprite(spawnX, spawnY, 'enemy-laser')
    laser.setBlendMode(Phaser.BlendModes.ADD)
    laser.setDepth(9)
    this.physics.add.existing(laser)
    laser.setData('createdAt', this.time.now)

    // Velocity straight ahead in the enemy's facing direction
    const body = laser.body as Phaser.Physics.Arcade.Body
    const speed = 700
    body.setVelocity(forward.x * speed, forward.y * speed)

    // Orient laser to match enemy's facing
    laser.rotation = rotation

    this.state.enemyLasers.add(laser)
  }

  private handleEnemyLaserHitPlayer = (
    enemyLaserObj: Phaser.GameObjects.GameObject,
    playerObj: Phaser.GameObjects.GameObject
  ): void => {
    const laser = enemyLaserObj as Phaser.GameObjects.Sprite
    if (laser && laser.active) laser.destroy()
    const player = playerObj as Phaser.GameObjects.Sprite
    if (!player) return
    this.damagePlayer(1)
  }

  private updateHealthUI(): void {
    if (!this.state.healthText) return
    this.state.healthText.setText(`Health: ${this.state.playerHealth}/${this.state.maxPlayerHealth}`)
  }

  private damagePlayer(amount: number): void {
    if (!this.state.player) return
    if (this.state.isPlayerInvulnerable) return

    this.state.playerHealth = Math.max(0, this.state.playerHealth - amount)
    this.updateHealthUI()

    // Feedback: explosion and invulnerability window (no flash)
    this.spawnHeroExplosionAt(this.state.player.x, this.state.player.y)
    this.state.isPlayerInvulnerable = true
    this.time.delayedCall(SkillSpaceScene.PLAYER_INVULNERABILITY_MS, () => {
      this.state.isPlayerInvulnerable = false
    })

    // If health depleted, soften controls feedback (no hard game over yet)
    if (this.state.playerHealth <= 0) {
      // Optional: further feedback; currently just ensures invulnerability window
    }
  }

  private handleLaserShieldHit = (
    laserObj: Phaser.GameObjects.GameObject,
    shieldObj: Phaser.GameObjects.GameObject
  ): void => {
    const laser = laserObj as Phaser.GameObjects.Sprite
    const shield = shieldObj as Phaser.GameObjects.Container
    
    if (!laser || !shield) return
    
    const shieldConfig = shield.getData('shieldConfig') as ShieldConfig
    if (!shieldConfig || !shieldConfig.isActive) return

    // Destroy the laser
    laser.destroy()

    // Damage the shield
    this.damageShield(shield, 1)

    // Create hit effect at impact point
    this.createShieldHitEffect(laser.x, laser.y, shieldConfig.color)
  }

  private damageShield(shield: Phaser.GameObjects.Container, damage: number): void {
    const shieldConfig = shield.getData('shieldConfig') as ShieldConfig
    if (!shieldConfig || !shieldConfig.isActive) return

    shieldConfig.health = Math.max(0, shieldConfig.health - damage)
    shieldConfig.lastHitTime = this.time.now

    // Update shield visuals based on health
    this.updateShieldVisuals(shield)

    // Update debug label
    const label = shield.getData('shieldLabel') as Phaser.GameObjects.Text
    if (label) {
      label.setText(`${shieldConfig.stationId}: ${shieldConfig.health}/${shieldConfig.maxHealth}${shieldConfig.isActive ? '' : ' (down)'}`)
    }

    // If shield is destroyed, deactivate it
    if (shieldConfig.health <= 0) {
      shieldConfig.isActive = false
      shield.setVisible(false)

      const body = shield.body as Phaser.Physics.Arcade.StaticBody
      if (body) {
        body.enable = false
      }
      
      // Create shield destruction effect
      this.createShieldDestructionEffect(shield.x, shield.y, shieldConfig.color)
    }

    // Update the shield config data
    shield.setData('shieldConfig', shieldConfig)
  }

  private updateShieldVisuals(shield: Phaser.GameObjects.Container): void {
    const shieldConfig = shield.getData('shieldConfig') as ShieldConfig
    const shieldSprite = shield.getData('shieldSprite') as Phaser.GameObjects.Image
    
    if (!shieldConfig || !shieldSprite) return

    const healthPercent = shieldConfig.health / shieldConfig.maxHealth
    let state: 'healthy' | 'damaged' | 'critical'
    
    if (healthPercent > 0.66) {
      state = 'healthy'
    } else if (healthPercent > 0.33) {
      state = 'damaged'
    } else {
      state = 'critical'
    }

    // Update texture based on shield state
    const newTexture = createShieldTexture(this, shieldConfig.color, state)
    shieldSprite.setTexture(newTexture)
  }

  private regenerateShields(): void {
    if (!this.state.shields) return

    const currentTime = this.time.now

    this.state.shields.children.each((shieldObj: Phaser.GameObjects.GameObject) => {
      const shield = shieldObj as Phaser.GameObjects.Container
      const shieldConfig = shield.getData('shieldConfig') as ShieldConfig
      
      if (!shieldConfig) return null

      const timeSinceLastHit = currentTime - (shieldConfig.lastHitTime || 0)

      // Start regenerating 3s after last hit
      if (shieldConfig.health < shieldConfig.maxHealth && timeSinceLastHit >= 3000) {
        const timeSinceLastRegen = currentTime - (shieldConfig.lastRegenTime || 0)
        if (timeSinceLastRegen >= shieldConfig.regenerationRate) {
          const wasInactive = !shieldConfig.isActive
          shieldConfig.health = Math.min(shieldConfig.maxHealth, shieldConfig.health + 1)
          shieldConfig.lastRegenTime = currentTime

          // Reactivate on first regen point
          if (wasInactive && shieldConfig.health > 0) {
            shieldConfig.isActive = true
            shield.setVisible(true)
            const body = shield.body as Phaser.Physics.Arcade.StaticBody
            if (body) {
              body.enable = true
            }
            this.createShieldReactivationEffect(shield.x, shield.y, shieldConfig.color)
          }

          // Update visuals on each regen tick
          this.updateShieldVisuals(shield)

          // Update debug label
          const label = shield.getData('shieldLabel') as Phaser.GameObjects.Text
          if (label) {
            label.setText(`${shieldConfig.stationId}: ${shieldConfig.health}/${shieldConfig.maxHealth}${shieldConfig.isActive ? '' : ' (down)'}`)
          }

          shield.setData('shieldConfig', shieldConfig)
        }
      }
      return null
    }, this)
  }

  private createShieldHitEffect(x: number, y: number, color: number): void {
    // Create a particle burst effect at hit location
    const particles = this.add.particles(x, y, 'laser-beam', {
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: color,
      speed: { min: 50, max: 150 },
      lifespan: 300,
      quantity: 5
    })

    // Clean up particles after animation
    this.time.delayedCall(500, () => {
      particles.destroy()
    })
  }

  private createShieldDestructionEffect(x: number, y: number, color: number): void {
    // Create a larger particle burst for shield destruction
    const particles = this.add.particles(x, y, 'laser-beam', {
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: color,
      speed: { min: 100, max: 250 },
      lifespan: 600,
      quantity: 15
    })

    this.time.delayedCall(800, () => {
      particles.destroy()
    })
  }

  private createShieldReactivationEffect(x: number, y: number, color: number): void {
    // Create a gentle reformation effect
    const particles = this.add.particles(x, y, 'laser-beam', {
      scale: { start: 0.1, end: 0.4 },
      alpha: { start: 0.3, end: 0.8 },
      tint: color,
      speed: { min: 20, max: 80 },
      lifespan: 800,
      quantity: 10
    })

    this.time.delayedCall(1000, () => {
      particles.destroy()
    })
  }
}