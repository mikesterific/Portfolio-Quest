import Phaser from "phaser";

/**
 * Player System - Centralized player functionality for Portfolio Quest
 * Handles player creation, movement, and rotation across all game scenes
 */

// Player configuration constants
const PLAYER_CONFIG = {
  SIZE: 128,
  SPEED: 200,
  DRAG: 500,
  AUTO_ROTATION_SPEED: 15, // degrees per frame for enhanced velocity-based rotation
  MIN_SPEED_FOR_ROTATION: 50, // minimum speed to trigger automatic rotation
} as const;

// Player state interface
interface PlayerState {
  player: Phaser.GameObjects.Sprite | null;
}

/**
 * Creates a player sprite with physics and rotation capabilities
 */
const createPlayer = (scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Sprite => {
  // Start with engines off (idle state)
  const player = scene.add.sprite(x, y, "hero-spaceship-off");
  player.setDisplaySize(PLAYER_CONFIG.SIZE, PLAYER_CONFIG.SIZE);
  scene.physics.add.existing(player);

  const playerBody = player.body as Phaser.Physics.Arcade.Body;
  playerBody.setSize(PLAYER_CONFIG.SIZE, PLAYER_CONFIG.SIZE);
  // Removed: playerBody.setCollideWorldBounds(true) - no collision detection
  playerBody.setDrag(PLAYER_CONFIG.DRAG);

  // Add rotation state tracking - start facing left
  const initialRotation = (3 * Math.PI) / 2; // 270 degrees = facing left (sprite faces up by default)
  player.setRotation(initialRotation);
  player.setData("targetRotation", initialRotation);

  // Add engine state tracking
  player.setData("enginesOn", false);

  return player;
};

/**
 * Updates player engine state based on input (engines on when moving, off when idle)
 */
const updatePlayerEngineState = (player: Phaser.GameObjects.Sprite, isMoving: boolean): void => {
  const currentEnginesOn = player.getData("enginesOn");

  // Only change texture if state actually changed to avoid unnecessary operations
  if (isMoving && !currentEnginesOn) {
    player.setTexture("hero-spaceship-on");
    player.setData("enginesOn", true);
  } else if (!isMoving && currentEnginesOn) {
    player.setTexture("hero-spaceship-off");
    player.setData("enginesOn", false);
  }
};

/**
 * Updates player rotation based on velocity with smooth interpolation
 */
const updatePlayerRotation = (
  player: Phaser.GameObjects.Sprite,
  velocity: { x: number; y: number },
): void => {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

  if (speed > PLAYER_CONFIG.MIN_SPEED_FOR_ROTATION) {
    // Calculate target rotation from velocity
    // Add +π/2 offset because sprite faces up by default, but 0° in Phaser points right
    const targetRotation = Phaser.Math.Angle.Between(0, 0, velocity.x, velocity.y) + Math.PI / 2;
    player.setData("targetRotation", targetRotation);
  }

  // Smooth interpolation to target rotation using enhanced speed
  const currentRotation = player.rotation;
  const targetRotation = player.getData("targetRotation");
  const enhancedRotationSpeed = PLAYER_CONFIG.AUTO_ROTATION_SPEED; // Use enhanced speed

  const rotationDiff = Phaser.Math.Angle.ShortestBetween(
    Phaser.Math.RadToDeg(currentRotation),
    Phaser.Math.RadToDeg(targetRotation),
  );

  if (Math.abs(rotationDiff) > 1) {
    const rotationStep = Math.sign(rotationDiff) * enhancedRotationSpeed * (Math.PI / 180);
    player.rotation += rotationStep;
  }
};

/**
 * Updates player velocity based on input with rotation and engine state
 */
const updatePlayerVelocity = (
  player: Phaser.GameObjects.Sprite,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
  speed: number = PLAYER_CONFIG.SPEED,
): void => {
  const playerBody = player.body as Phaser.Physics.Arcade.Body;
  playerBody.setVelocity(0);

  const isLeftPressed = cursors.left.isDown || keyboard.addKey("A").isDown;
  const isRightPressed = cursors.right.isDown || keyboard.addKey("D").isDown;
  const isUpPressed = cursors.up.isDown || keyboard.addKey("W").isDown;
  const isDownPressed = cursors.down.isDown || keyboard.addKey("S").isDown;

  // Check if any movement key is pressed
  const isMoving = isLeftPressed || isRightPressed || isUpPressed || isDownPressed;

  if (isLeftPressed) playerBody.setVelocityX(-speed);
  else if (isRightPressed) playerBody.setVelocityX(speed);

  if (isUpPressed) playerBody.setVelocityY(-speed);
  else if (isDownPressed) playerBody.setVelocityY(speed);

  // Update engine state based on input
  updatePlayerEngineState(player, isMoving);

  updatePlayerRotation(player, { x: playerBody.velocity.x, y: playerBody.velocity.y });
};

/**
 * Preloads player assets - call this in scene preload methods
 */
const preloadPlayerAssets = (scene: Phaser.Scene): void => {
  scene.load.image("hero-spaceship-off", "assets/images/HeroSpaceShipOff.png");
  scene.load.image("hero-spaceship-on", "assets/images/HeroSpaceShipOn.png");
};

/**
 * Utility function to find nearest object to player (for interactions)
 */
const findNearestObject = <T extends Phaser.GameObjects.GameObject>(
  player: { x: number; y: number },
  objects: T[],
  maxDistance: number,
): T | null => {
  const calculateDistance = (
    obj1: { x: number; y: number },
    obj2: { x: number; y: number },
  ): number => Phaser.Math.Distance.Between(obj1.x, obj1.y, obj2.x, obj2.y);

  return objects.reduce(
    (nearest: { object: T | null; distance: number }, obj) => {
      const sprite = obj as unknown as { x: number; y: number };
      const distance = calculateDistance(player, sprite);

      if (distance < maxDistance && distance < nearest.distance) {
        return { object: obj, distance };
      }
      return nearest;
    },
    { object: null, distance: Infinity },
  ).object;
};

// Export all player system functionality as a default object
export default {
  PLAYER_CONFIG,
  createPlayer,
  updatePlayerVelocity,
  updatePlayerRotation,
  updatePlayerEngineState,
  preloadPlayerAssets,
  findNearestObject,
};

// Also provide named exports for convenience
export {
  PLAYER_CONFIG,
  createPlayer,
  updatePlayerVelocity,
  updatePlayerRotation,
  updatePlayerEngineState,
  preloadPlayerAssets,
  findNearestObject,
  type PlayerState,
};
