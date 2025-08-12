const Phaser = require('phaser').default
const {
  CollisionLayer,
  ShieldZone,
  CollisionLayerHelper,
  ShieldMapManager,
  ShieldZoneSystem
} = require('@/game/systems/ShieldMappingSystem')

describe('ShieldMappingSystem', () => {
  let scene
  beforeEach(() => {
    scene = new Phaser.Scene({ key: 'TestScene' })
  })

  const makeConfig = (overrides={}) => ({
    dockingRadius: 10,
    barrierRadius: 20,
    detectionRadius: 30,
    stationId: 's1',
    position: new Phaser.Math.Vector2(0, 0),
    isActive: true,
    ...overrides
  })

  test('ShieldZoneSystem checkCollision across zones and inactive', () => {
    const sys = new ShieldZoneSystem(makeConfig())
    // Docking
    let r = sys.checkCollision(new Phaser.Math.Vector2(0, 0), CollisionLayer.PLAYER_SHIP)
    expect(r.zone).toBe(ShieldZone.DOCKING)
    expect(r.collision).toBe(true)

    // Barrier
    r = sys.checkCollision(new Phaser.Math.Vector2(15, 0), CollisionLayer.PLAYER_SHIP)
    expect(r.zone).toBe(ShieldZone.BARRIER)

    // Detection
    r = sys.checkCollision(new Phaser.Math.Vector2(25, 0), CollisionLayer.PLAYER_SHIP)
    expect(r.zone).toBe(ShieldZone.DETECTION)

    // Outside
    r = sys.checkCollision(new Phaser.Math.Vector2(40, 0), CollisionLayer.PLAYER_SHIP)
    expect(r.collision).toBe(false)

    // Inactive
    const inactive = new ShieldZoneSystem(makeConfig({ isActive: false }))
    r = inactive.checkCollision(new Phaser.Math.Vector2(0, 0), CollisionLayer.PLAYER_SHIP)
    expect(r.collision).toBe(false)
    expect(r.zone).toBeNull()
  })

  test('ShieldZoneSystem updates state and position, getConfig clones data', () => {
    const sys = new ShieldZoneSystem(makeConfig())
    sys.updateState(false)
    expect(sys.getConfig().isActive).toBe(false)
    const newPos = new Phaser.Math.Vector2(5, 5)
    sys.updatePosition(newPos)
    const cfg = sys.getConfig()
    expect(cfg.position.x).toBe(5)
    expect(cfg.position.y).toBe(5)
  })

  test('ShieldMapManager register/get/update/remove shields and collisions', () => {
    const mgr = new ShieldMapManager(scene)
    mgr.registerShield('s1', makeConfig())
    mgr.registerShield('s2', makeConfig({ stationId: 's2', position: new Phaser.Math.Vector2(100, 0) }))

    expect(mgr.getShieldCount()).toBe(2)
    expect(mgr.getShieldForStation('s1')).toBeInstanceOf(ShieldZoneSystem)

    // Blocking collision should be for inner zones when active
    const res = mgr.getBlockingCollision(new Phaser.Math.Vector2(5, 0), CollisionLayer.PLAYER_SHIP)
    expect(res?.stationId).toBe('s1')

    // Update states
    mgr.updateShieldState('s1', false)
    expect(mgr.getShieldForStation('s1')?.getConfig().isActive).toBe(false)
    mgr.updateGlobalShieldState(false)
    expect(mgr.hasActiveShields()).toBe(false)

    // getAllShieldConfigs returns cloned map
    const all = mgr.getAllShieldConfigs()
    expect(all.size).toBe(2)

    // Remove and clear
    mgr.removeShield('s1')
    expect(mgr.getShieldForStation('s1')).toBeNull()
    mgr.clearAllShields()
    expect(mgr.getShieldCount()).toBe(0)
  })

  test('checkAllShieldCollisions filters IGNORE and returns empty for non-blocking', () => {
    const mgr = new ShieldMapManager(scene)
    // Enemy laser should be BLOCK in barrier, IGNORE in detection; place at detection ring
    mgr.registerShield('s1', makeConfig({ detectionRadius: 30, barrierRadius: 10 }))
    const res = mgr.checkAllShieldCollisions(new Phaser.Math.Vector2(25, 0), CollisionLayer.ENEMY_LASER)
    // Detection with IGNORE should be filtered out
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(0)
  })

  test('CollisionLayerHelper default fallback and non-occluder LOS false case', () => {
    const mgr = new ShieldMapManager(scene)
    // No occluders -> line not blocked
    const blocked = mgr.isLineBlockedByStationsWithSamples(new Phaser.Math.Vector2(0,0), new Phaser.Math.Vector2(10,10), 4)
    expect(blocked).toBe(false)

    // Default collision layer fallback for object with no flags
    const obj = scene.add.container(0,0)
    expect(obj.getData('collisionLayer')).toBeUndefined()
    const { CollisionLayerHelper } = require('@/game/systems/ShieldMappingSystem')
    expect(CollisionLayerHelper.getCollisionLayer(obj)).toBe(CollisionLayer.EFFECTS)
  })

  test('Station occluders register/update/remove/check and LOS sampling', () => {
    const mgr = new ShieldMapManager(scene)
    mgr.registerStationOccluder('s1', new Phaser.Math.Vector2(10, 0), 5)
    mgr.registerStationOccluder('s2', new Phaser.Math.Vector2(100, 0), 10)

    expect(mgr.getStationOccluders().length).toBe(2)

    // Update position
    mgr.updateStationOccluderPosition('s1', new Phaser.Math.Vector2(20, 0))
    const occ = mgr.getStationOccluders().find(o => o.stationId === 's1')
    expect(occ?.position.x).toBe(20)

    // LOS block sampling
    const blocked = mgr.isLineBlockedByStationsWithSamples(new Phaser.Math.Vector2(0, 0), new Phaser.Math.Vector2(30, 0), 5)
    expect(blocked).toBe(true)

    // Remove and clear
    mgr.removeStationOccluder('s2')
    expect(mgr.getStationOccluders().some(o => o.stationId === 's2')).toBe(false)
    mgr.clearStationOccluders()
    expect(mgr.getStationOccluders().length).toBe(0)
  })

  test('CollisionLayerHelper get/set/shouldBlock logic', () => {
    const obj = scene.add.container(0,0)
    obj.setData('isEnemy', true)
    expect(CollisionLayerHelper.getCollisionLayer(obj)).toBe(CollisionLayer.ENEMY_SHIP)
    CollisionLayerHelper.setCollisionLayer(obj, CollisionLayer.PLAYER_LASER)
    expect(obj.getData('collisionLayer')).toBe(CollisionLayer.PLAYER_LASER)

    expect(CollisionLayerHelper.shouldBlock(CollisionLayer.PLAYER_SHIP, ShieldZone.BARRIER)).toBe(true)
    expect(CollisionLayerHelper.shouldBlock(CollisionLayer.PLAYER_LASER, ShieldZone.DETECTION)).toBe(false)
  })
})
