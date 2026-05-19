const Phaser = require("phaser").default;
const {
  createPlayer,
  updatePlayerVelocity,
  updatePlayerRotation,
  updatePlayerEngineState,
  preloadPlayerAssets,
  findNearestObject,
  PLAYER_CONFIG,
} = require("@/game/systems/PlayerSystem");

describe("PlayerSystem", () => {
  let scene;
  beforeEach(() => {
    scene = new Phaser.Scene({ key: "TestScene" });
  });

  test("createPlayer initializes sprite with physics and data", () => {
    const p = createPlayer(scene, 100, 200);
    expect(p).toBeTruthy();
    expect(p.getData("enginesOn")).toBe(false);
    expect(p.getData("targetRotation")).toBeDefined();
    expect(p.body).toBeDefined();
  });

  test("preloadPlayerAssets loads textures", () => {
    const spy = jest.spyOn(scene.load, "image");
    preloadPlayerAssets(scene);
    expect(spy).toHaveBeenCalledWith("hero-spaceship-off", "assets/images/HeroSpaceShipOff.png");
    expect(spy).toHaveBeenCalledWith("hero-spaceship-on", "assets/images/HeroSpaceShipOn.png");
  });

  test("updatePlayerEngineState toggles textures only on state change", () => {
    const p = scene.add.sprite(0, 0, "hero-spaceship-off");
    p.setData("enginesOn", false);
    const texSpy = jest.spyOn(p, "setTexture");

    // Engines turn on
    updatePlayerEngineState(p, true);
    expect(p.getData("enginesOn")).toBe(true);
    expect(texSpy).toHaveBeenCalledWith("hero-spaceship-on");

    // Calling again with same state should not change texture
    texSpy.mockClear();
    updatePlayerEngineState(p, true);
    expect(texSpy).not.toHaveBeenCalled();

    // Engines turn off
    updatePlayerEngineState(p, false);
    expect(p.getData("enginesOn")).toBe(false);
    expect(texSpy).toHaveBeenCalledWith("hero-spaceship-off");
  });

  test("updatePlayerRotation updates target and interpolates towards it", () => {
    const p = scene.add.sprite(0, 0, "hero-spaceship-off");
    p.rotation = 0;
    p.setData("targetRotation", 0);

    // Low speed: only interpolation runs (targetRotation unchanged)
    updatePlayerRotation(p, { x: 0, y: 0 });
    expect(typeof p.rotation).toBe("number");

    // High speed: updates targetRotation and then interpolates
    const setDataSpy = jest.spyOn(p, "setData");
    updatePlayerRotation(p, { x: 100, y: 0 });
    expect(setDataSpy).toHaveBeenCalledWith("targetRotation", expect.any(Number));
  });

  test("updatePlayerVelocity sets velocities and updates engine + rotation", () => {
    const p = scene.add.sprite(0, 0, "hero-spaceship-off");
    p.body = {
      velocity: { x: 0, y: 0 },
      setVelocity: jest.fn(),
      setVelocityX: jest.fn(function (x) {
        this.velocity.x = x;
        return this;
      }),
      setVelocityY: jest.fn(function (y) {
        this.velocity.y = y;
        return this;
      }),
    };
    p.setData("targetRotation", 0);
    p.setData("enginesOn", false);

    const cursors = {
      left: { isDown: true },
      right: { isDown: false },
      up: { isDown: false },
      down: { isDown: false },
    };
    const keyboard = {
      addKey: jest.fn().mockImplementation((key) => {
        return { isDown: false };
      }),
    };

    const engineSpy = jest.spyOn(p, "setData");

    updatePlayerVelocity(p, cursors, keyboard, 123);

    expect(p.body.setVelocity).toHaveBeenCalledWith(0);
    expect(p.body.setVelocityX).toHaveBeenCalledWith(-123);
    // engine state was updated via setData calls
    expect(engineSpy).toHaveBeenCalled();
    expect(keyboard.addKey).not.toHaveBeenCalledWith("Q");
    expect(keyboard.addKey).not.toHaveBeenCalledWith("R");
  });

  test("findNearestObject returns nearest within maxDistance or null", () => {
    const player = { x: 0, y: 0 };
    const a = scene.add.container(10, 0);
    const b = scene.add.container(50, 0);
    const c = scene.add.container(200, 0);

    const res1 = findNearestObject(player, [a, b, c], 60);
    expect(res1).toBe(a);

    const res2 = findNearestObject(player, [c], 50);
    expect(res2).toBeNull();
  });

  test("updatePlayerVelocity ignores Q/R and uses velocity-based rotation", () => {
    const p = scene.add.sprite(0, 0, "hero-spaceship-off");
    p.body = {
      velocity: { x: 100, y: 0 }, // Fast movement that would normally cause rotation
      setVelocity: jest.fn(),
      setVelocityX: jest.fn(function (x) {
        this.velocity.x = x;
        return this;
      }),
      setVelocityY: jest.fn(function (y) {
        this.velocity.y = y;
        return this;
      }),
    };
    p.rotation = 0;
    p.setData("targetRotation", 0);
    p.setData("enginesOn", false);

    const cursors = {
      left: { isDown: false },
      right: { isDown: true },
      up: { isDown: false },
      down: { isDown: false },
    };
    const keyboard = {
      addKey: jest.fn().mockImplementation((key) => {
        return { isDown: false };
      }),
    };

    const originalRotation = p.rotation;
    updatePlayerVelocity(p, cursors, keyboard, 200);

    expect(keyboard.addKey).not.toHaveBeenCalledWith("Q");
    expect(keyboard.addKey).not.toHaveBeenCalledWith("R");
    expect(p.rotation).not.toBe(originalRotation);
    expect(p.rotation).toBeGreaterThan(0);
  });

  test("PLAYER_CONFIG contains enhanced rotation speeds", () => {
    expect(PLAYER_CONFIG.AUTO_ROTATION_SPEED).toBe(15);
    expect(PLAYER_CONFIG.MIN_SPEED_FOR_ROTATION).toBe(50);
    expect(PLAYER_CONFIG.SIZE).toBe(128);
    expect(PLAYER_CONFIG.SPEED).toBe(200);
    expect(PLAYER_CONFIG.DRAG).toBe(500);
  });
});
