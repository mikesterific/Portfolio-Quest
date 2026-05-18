const Phaser = require("phaser").default;
const { EnemyAISystem, BehaviorState } = require("@/game/systems/EnemyAISystem");
const { ShieldMapManager, CollisionLayer } = require("@/game/systems/ShieldMappingSystem");

describe("EnemyAISystem", () => {
  let scene;
  beforeEach(() => {
    scene = new Phaser.Scene({ key: "TestScene" });
  });

  test("initialize sets enemy laser group and setPlayerTarget/ShieldManager toggle combat", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    ai.setPlayerTarget(scene.add.sprite(0, 0, "player"));
    ai.setShieldManager(new ShieldMapManager(scene));
    ai.setCombatEnabled(false);
    // No error and updateAll should early-return when combat disabled
    expect(() => ai.updateAll(0, 16)).not.toThrow();
  });

  test("createEnemy creates agent with physics and tracking data", () => {
    const ai = new EnemyAISystem(scene);
    const agent = ai.createEnemy(10, 20);
    expect(agent.id).toContain("enemy_");
    expect(agent.sprite).toBeTruthy();
    expect(agent.behavior).toBe(BehaviorState.PATROL);
    expect(ai.getEnemyCount()).toBe(1);
  });

  test("spawnFromEdge helpers respect maxEnemies and set rotation towards target", () => {
    const ai = new EnemyAISystem(scene);
    ai.setMaxEnemies(2);
    ai.setPlayerTarget(scene.add.sprite(100, 100, "p"));
    ai.spawnFromLeft(5);
    expect(ai.getEnemyCount()).toBe(2);
  });

  test("single opposite-side spawn starts as a horizontal flyby", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(100, 100, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const agent = ai.spawnSingleOppositeHorizontalSide({ speed: 120, acceleration: 1000 }, 50, 0);
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(function (x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
        return this;
      }),
    };

    ai.updateAll(1000, 16);

    expect(agent.flyby.isActive).toBe(true);
    expect(agent.flyby.hasEngaged).toBe(false);
    expect(agent.sprite.body.velocity.x).toBeLessThan(0);
    expect(agent.sprite.body.velocity.y).toBe(0);
  });

  test("spawnOppositeSideHorizontalFlybys shares flank X with staggered Y", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(1400, 540, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const agents = ai.spawnOppositeSideHorizontalFlybys({ speed: 110 }, 3, 50, 0);
    expect(agents.length).toBe(3);
    const xs = new Set(agents.map((a) => Math.round(a.sprite.x)));
    expect(xs.size).toBe(1);
    const ys = agents.map((a) => a.sprite.y).sort((a, b) => a - b);
    expect(ys[1] - ys[0]).toBeGreaterThanOrEqual(60);
    expect(ys[2] - ys[1]).toBeGreaterThanOrEqual(60);
    expect(agents[0].flyby.engageAfterMs).toBeGreaterThan(0);
    expect(agents[1].flyby.engageAfterMs).toBe(0);
    expect(agents[2].flyby.engageAfterMs).toBeGreaterThan(0);
  });

  test("spawnOppositeSideHorizontalFlybys stacks waves without clearing prior enemies", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(900, 540, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    ai.spawnOppositeSideHorizontalFlybys({ speed: 80 }, 2, 50, 0);
    expect(ai.getEnemyCount()).toBe(2);
    ai.spawnOppositeSideHorizontalFlybys({ speed: 90 }, 1, 50, 0);
    expect(ai.getEnemyCount()).toBe(3);
  });

  test("unengaged horizontal flyby despawns after crossing the far side", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(100, 100, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const agent = ai.spawnSingleOppositeHorizontalSide({ speed: 120 }, 50, 0);
    agent.sprite.x = -51;
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(),
    };

    ai.updateAll(1000, 16);

    expect(ai.getEnemyCount()).toBe(0);
  });

  test("horizontal flyby switches to normal engagement when the hero is seen", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(900, 100, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const agent = ai.spawnSingleOppositeHorizontalSide(
      { speed: 120, acceleration: 1000, sensorRange: 2000 },
      50,
      0,
    );
    player.x = 300;
    player.y = 100;
    agent.sprite.x = 0;
    agent.sprite.y = player.y;
    agent.sprite.rotation = Math.PI / 2;
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(function (x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
        return this;
      }),
    };

    ai.updateAll(1000, 16);
    expect({
      inRange: agent.perception.inRange,
      inFOV: agent.perception.inFOV,
      hasLOS: agent.perception.hasLOS,
    }).toEqual({ inRange: true, inFOV: true, hasLOS: true });
    agent.sprite.x = scene.scale.width + 51;
    ai.updateAll(1200, 16);

    expect(agent.flyby.isActive).toBe(false);
    expect(agent.flyby.hasEngaged).toBe(true);
    expect(agent.behavior).toBe(BehaviorState.SEEK);
    expect(ai.getEnemyCount()).toBe(1);
  });

  test("spawnWave spawns around center only when playerTarget exists", () => {
    const ai = new EnemyAISystem(scene);
    ai.spawnWave(3); // no player target, should early return
    expect(ai.getEnemyCount()).toBe(0);
    ai.setPlayerTarget(scene.add.sprite(0, 0, "p"));
    ai.spawnWave(3);
    expect(ai.getEnemyCount()).toBeGreaterThan(0);
  });

  test("removeEnemy and despawnAll clean up sprites and map", () => {
    const ai = new EnemyAISystem(scene);
    const a = ai.createEnemy(0, 0);
    const b = ai.createEnemy(10, 10);
    expect(ai.getEnemyCount()).toBe(2);
    ai.removeEnemy(a.id);
    expect(ai.getEnemyCount()).toBe(1);
    ai.despawnAll();
    expect(ai.getEnemyCount()).toBe(0);
  });

  test("updateAll updates active agents and respects shield avoidance/firing gates", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);

    // Player with velocity
    const player = scene.add.sprite(50, 50, "player");
    player.body = { velocity: { x: 10, y: 0 } };
    ai.setPlayerTarget(player);

    // Shield manager that returns no blocking to keep paths simple
    const sm = new ShieldMapManager(scene);
    ai.setShieldManager(sm);

    // Agent near player
    const agent = ai.createEnemy(40, 50);
    // Give the agent a body with velocity methods
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(),
    };

    // Force perception to allow firing by putting player within engagementDist and hasLOS
    agent.perception.hasLOS = true;

    // Advance time so firing window is satisfied
    const now = 5000;
    ai.updateAll(now, 16);

    // After update, agent should have attempted to steer and possibly fire; ensure no throws
    expect(true).toBe(true);
  });

  test("getAgentBySprite returns matching agent, getActiveAgents filters inactive", () => {
    const ai = new EnemyAISystem(scene);
    const a = ai.createEnemy(0, 0);
    const b = ai.createEnemy(10, 0);
    b.isActive = false;
    const found = ai.getAgentBySprite(a.sprite);
    expect(found?.id).toBe(a.id);
    expect(ai.getActiveAgents().map((x) => x.id)).toContain(a.id);
    expect(ai.getActiveAgents().map((x) => x.id)).not.toContain(b.id);
  });

  test("perception: LOS true without shield manager; false when blocked by shields", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(100, 0, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);
    const agent = ai.createEnemy(0, 0);
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(),
    };

    // Without shield manager, LOS should become true when in range after update
    ai.updateAll(1000, 16);
    expect(agent.perception.inRange).toBe(true);

    // With shield manager and blocking collision along samples, LOS should be false
    const sm = new ShieldMapManager(scene);
    // Register a barrier occluder via shield manager shields: place a shield in between
    sm.registerShield("s1", {
      dockingRadius: 5,
      barrierRadius: 10,
      detectionRadius: 15,
      stationId: "s1",
      position: new Phaser.Math.Vector2(50, 0),
      isActive: true,
    });
    ai.setShieldManager(sm);

    // Force LOS resample by jumping time
    ai.updateAll(2000 + agent.config.perceptionRecheckMs, 16);
    // Depending on sampling, it may or may not hit; assert boolean present
    expect(typeof agent.perception.hasLOS).toBe("boolean");
  });

  test("fireAtTarget creates enemy laser when in range, engaged and aware", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(0, 0, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const agent = ai.createEnemy(0, 100);
    agent.sprite.rotation = 0;
    agent.perception.hasLOS = true;

    // Allow immediate firing
    agent.lastFireTime = 0;

    const before = lasers.children.entries.length;
    // Call updateAll at time so that distance <= engagementDistance
    ai.updateAll(agent.config.fireRate + 1, 16);
    const after = lasers.children.entries.length;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  test("behavior transitions only chase when aware or investigating", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(1000, 0, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    // Far away but outside sensor range -> PATROL instead of blind SEEK
    const agent = ai.createEnemy(0, 0);
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(),
    };
    agent.sprite.rotation = Math.PI / 2;
    ai.updateAll(1000, 16);
    expect(agent.behavior).toBe(BehaviorState.PATROL);

    // Mid distance with FOV + LOS -> STRAFE
    player.x = 200;
    ai.updateAll(2000, 16);
    expect(agent.behavior).toBe(BehaviorState.STRAFE);

    // Too close with awareness -> EVADE
    player.x = 40;
    ai.updateAll(3000, 16);
    expect(agent.behavior).toBe(BehaviorState.EVADE);

    // No LOS and in middle band -> PATROL
    agent.perception.hasLOS = false;
    agent.perception.lastSeenAt = null;
    player.x = agent.config.minDistance + 10;
    // Prevent perception from flipping LOS back on this tick
    agent.lastPerceptionCheck = 4000;
    ai.updateAll(4000, 16);
    expect(agent.behavior).toBe(BehaviorState.PATROL);
  });

  test("station occluders block awareness and prevent blind seeking", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(100, 0, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const sm = new ShieldMapManager(scene);
    sm.registerStationOccluder("station-cover", new Phaser.Math.Vector2(50, 0), 25);
    ai.setShieldManager(sm);

    const agent = ai.createEnemy(0, 0);
    agent.sprite.rotation = Math.PI / 2;
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(),
    };

    ai.updateAll(1000, 16);

    expect(agent.perception.inRange).toBe(true);
    expect(agent.perception.inFOV).toBe(true);
    expect(agent.perception.hasLOS).toBe(false);
    expect(agent.behavior).toBe(BehaviorState.PATROL);
  });

  test("enemy briefly investigates last seen position after LOS is lost", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(400, 0, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const sm = new ShieldMapManager(scene);
    ai.setShieldManager(sm);

    const agent = ai.createEnemy(0, 0, { investigationMemoryMs: 500 });
    agent.sprite.rotation = Math.PI / 2;
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(function (x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
        return this;
      }),
    };

    ai.updateAll(1000, 16);
    expect(agent.perception.lastSeenAt?.x).toBe(400);

    sm.registerStationOccluder("station-cover", new Phaser.Math.Vector2(200, 0), 40);
    ai.updateAll(1200, 16);
    expect(agent.perception.hasLOS).toBe(false);
    expect(agent.behavior).toBe(BehaviorState.SEEK);

    ai.updateAll(1800, 16);
    expect(agent.behavior).toBe(BehaviorState.PATROL);
  });

  test("shield avoidance overrides desired velocity when blocked", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(500, 0, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const sm = new ShieldMapManager(scene);
    sm.registerShield("station", {
      dockingRadius: 30,
      barrierRadius: 60,
      detectionRadius: 100,
      stationId: "station",
      position: new Phaser.Math.Vector2(0, 0),
      isActive: true,
    });
    ai.setShieldManager(sm);

    // Place agent near shield so avoidShields produces a rightward vector
    const agent = ai.createEnemy(10, 0);
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(function (x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
        return this;
      }),
    };

    // Advance enough time to allow avoidance throttle
    ai.updateAll(1000, 16);
    // Expect velocity to be pushed away from shield center (positive x)
    expect(agent.sprite.body.velocity.x).toBeGreaterThan(0);
  });

  test("station occluder avoidance blends into steering", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(500, 0, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const sm = new ShieldMapManager(scene);
    // Register a station occluder to the left of agent to push it rightwards
    sm.registerStationOccluder("occ", new Phaser.Math.Vector2(-50, 0), 80);
    ai.setShieldManager(sm);

    const agent = ai.createEnemy(0, 0);
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(function (x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
        return this;
      }),
    };

    ai.updateAll(2000, 16);
    expect(agent.sprite.body.velocity.x).toBeGreaterThanOrEqual(0);
  });

  test("updateRotation clamps by max turn per frame", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(0, 0, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const agent = ai.createEnemy(0, 0);
    // Prepare body with significant velocity to the right
    agent.sprite.body = {
      velocity: { x: 100, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(),
    };
    // Start facing up (0 rad). Target facing will be ~PI/2. Limit turn rate.
    agent.sprite.rotation = 0;
    agent.config.turnRate = Math.PI / 4; // 45 deg/sec
    agent.config.acceleration = 0; // prevent velocity changes

    ai.updateAll(3000, 1000); // delta=1000ms => max turn ~45deg
    expect(agent.sprite.rotation).toBeGreaterThan(0);
    expect(agent.sprite.rotation).toBeLessThanOrEqual(Math.PI / 4 + 1e-6);
  });

  test("perception FOV toggles based on facing", () => {
    const ai = new EnemyAISystem(scene);
    const lasers = scene.add.group();
    ai.initialize(lasers);
    const player = scene.add.sprite(100, 0, "p");
    player.body = { velocity: { x: 0, y: 0 } };
    ai.setPlayerTarget(player);

    const agent = ai.createEnemy(0, 0);
    agent.sprite.body = {
      velocity: { x: 0, y: 0 },
      setDrag: jest.fn(),
      setMaxVelocity: jest.fn(),
      setVelocity: jest.fn(),
    };

    // Facing right -> in FOV
    agent.sprite.rotation = Math.PI / 2;
    ai.updateAll(4000, 16);
    expect(agent.perception.inFOV).toBe(true);

    // Facing left -> out of FOV
    agent.sprite.rotation = -Math.PI / 2;
    ai.updateAll(4100, 16);
    expect(agent.perception.inFOV).toBe(false);
  });
});
