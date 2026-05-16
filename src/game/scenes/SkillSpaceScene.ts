import Phaser from "phaser";
import gameEventBridge from "../GameEventBridge";
import {
  createPlayer,
  updatePlayerVelocity,
  preloadPlayerAssets,
  findNearestObject,
} from "../systems/PlayerSystem";
import {
  ShieldMapManager,
  CollisionLayer,
  CollisionLayerHelper,
} from "../systems/ShieldMappingSystem";
import type { ShieldZoneConfig } from "../systems/ShieldMappingSystem";
import { EnemyAISystem } from "../systems/EnemyAISystem";
import { SpaceStationManager, type SpaceStationData } from "../managers/SpaceStationManager";
import { EffectsManager } from "../managers/EffectsManager";
import { UIManager } from "../managers/UIManager";
import { SceneConfigManager } from "../managers/SceneConfigManager";
import {
  PLAYER_CONFIG,
  COMBAT_CONFIG,
  SHIELD_CONFIG,
  UI_CONFIG,
  validateGameConfig,
  GAME_CONFIG,
} from "../config";

// Types for scene state
interface SceneState {
  player: Phaser.GameObjects.Sprite | null;
  spaceStations: Phaser.GameObjects.Group | null;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
  interactionPrompt: Phaser.GameObjects.Text | null;
  healthText: Phaser.GameObjects.Text | null;
  nearestStation: Phaser.GameObjects.GameObject | null;
  isDocking: boolean;
  isDocked: boolean;
  dockedStation: Phaser.GameObjects.GameObject | null;
  isModalOpen: boolean;
  lasers: Phaser.GameObjects.Group | null;
  laserTimer: Phaser.Time.TimerEvent | null;
  enemyLasers: Phaser.GameObjects.Group | null;
  playerHealth: number;
  maxPlayerHealth: number;
  isPlayerInvulnerable: boolean;
  shields: Phaser.GameObjects.Group | null;
  shieldMapManager: ShieldMapManager | null;
  enemyAI: EnemyAISystem | null;
  combatEnabled: boolean;
  unlockedStations?: Set<string>;
  dockSpawnedForStation?: Set<string>;
  totalStationCount?: number;
  laserSound?: Phaser.Sound.BaseSound;
  enemyLaserSound?: Phaser.Sound.BaseSound;
  soundEnabled: boolean;
}

// SpaceStationData is now imported from SpaceStationManager

interface ShieldConfig {
  radius: number;
  health: number;
  maxHealth: number;
  color: number;
  regenerationRate: number;
  lastHitTime: number;
  lastRegenTime: number;
  isActive: boolean;
  stationId: string;
}

// Functions moved to respective managers

// Shield system functions
const createShieldTexture = (
  scene: Phaser.Scene,
  color: number,
  state: "healthy" | "damaged" | "critical",
): string => {
  const textureKey = `shield-${state}-${color.toString(16)}`;
  if (scene.textures.exists(textureKey)) return textureKey;

  const size = 240;
  const g = scene.add.graphics({ x: 0, y: 0 });
  g.clear();

  // Create gradient effect based on shield state
  let alpha = 0.3;
  let innerAlpha = 0.1;

  switch (state) {
    case "healthy":
      alpha = 0.3;
      innerAlpha = 0.1;
      break;
    case "damaged":
      alpha = 0.4;
      innerAlpha = 0.15;
      color = 0xffaa00; // Yellow tint
      break;
    case "critical":
      alpha = 0.5;
      innerAlpha = 0.2;
      color = 0xff4400; // Red tint
      break;
  }

  // Outer ring (stronger visibility)
  g.fillStyle(color, alpha);
  g.fillCircle(size / 2, size / 2, size / 2);

  // Inner fill (more subtle)
  g.fillStyle(color, innerAlpha);
  g.fillCircle(size / 2, size / 2, size / 2 - 4);

  // Energy ripple effect
  for (let i = 0; i < 3; i++) {
    const rippleRadius = size / 2 - i * 15 - 10;
    if (rippleRadius > 0) {
      g.lineStyle(2, color, alpha * 0.8);
      g.strokeCircle(size / 2, size / 2, rippleRadius);
    }
  }

  g.generateTexture(textureKey, size, size);
  g.destroy();

  return textureKey;
};

const getShieldConfigForStation = (
  station: SpaceStationData,
): Omit<ShieldConfig, "health" | "lastHitTime" | "lastRegenTime" | "isActive" | "stationId"> => {
  // Uniform shield behavior for all stations (match frontend station)
  return {
    radius: SHIELD_CONFIG.geometry.radius,
    maxHealth: SHIELD_CONFIG.health.max,
    color: SHIELD_CONFIG.visual.baseColor,
    regenerationRate: SHIELD_CONFIG.health.regenerationRate,
  };
};

const createStationShield = (
  scene: Phaser.Scene,
  station: SpaceStationData,
  x: number,
  y: number,
): Phaser.GameObjects.Container => {
  const baseConfig = getShieldConfigForStation(station);
  const shieldConfig: ShieldConfig = {
    ...baseConfig,
    health: baseConfig.maxHealth,
    lastHitTime: 0,
    lastRegenTime: 0,
    isActive: true,
    stationId: station.id,
  };

  const shieldContainer = scene.add.container(x, y);

  // Create shield visual
  const healthyTexture = createShieldTexture(scene, baseConfig.color, "healthy");
  const shieldSprite = scene.add.image(0, 0, healthyTexture);
  shieldSprite.setDisplaySize(baseConfig.radius * 2, baseConfig.radius * 2);
  shieldSprite.setDepth(2); // Above stations but below player

  // Add subtle pulse animation
  scene.tweens.add({
    targets: shieldSprite,
    scaleX: { from: 0.98, to: 1.02 },
    scaleY: { from: 0.98, to: 1.02 },
    duration: 3000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  shieldContainer.add(shieldSprite);

  // Store shield configuration
  shieldContainer.setData("shieldConfig", shieldConfig);
  shieldContainer.setData("isShield", true);
  shieldContainer.setData("shieldSprite", shieldSprite);

  // Setup physics body for collision detection
  scene.physics.add.existing(shieldContainer, true); // Static body
  const body = shieldContainer.body as Phaser.Physics.Arcade.StaticBody;
  body.setCircle(baseConfig.radius, -baseConfig.radius, -baseConfig.radius);

  return shieldContainer;
};

/**
 * Skills Space Scene - Interactive space command center showcasing technical skills
 * Space stations represent different skill categories in organized sectors
 */
export class SkillSpaceScene extends Phaser.Scene {
  // Manager instances
  private stationManager: SpaceStationManager;
  private effectsManager: EffectsManager;
  private uiManager: UIManager;
  private sceneConfigManager: SceneConfigManager;

  private state: SceneState = {
    player: null,
    spaceStations: null,
    cursors: null,
    interactionPrompt: null,
    healthText: null,
    nearestStation: null,
    isDocking: false,
    isDocked: false,
    dockedStation: null,
    isModalOpen: false,
    lasers: null,
    laserTimer: null,
    enemyLasers: null,
    playerHealth: PLAYER_CONFIG.health.max,
    maxPlayerHealth: PLAYER_CONFIG.health.max,
    isPlayerInvulnerable: false,
    shields: null,
    shieldMapManager: null,
    enemyAI: null,
    combatEnabled: true, // Start with combat enabled so enemies spawn when docking
    unlockedStations: new Set<string>(),
    dockSpawnedForStation: new Set<string>(),
    totalStationCount: 0,
    laserSound: undefined,
    enemyLaserSound: undefined,
    soundEnabled: true,
  };

  private xpTotal: number = 0;
  private xpText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: "SkillSpaceScene" });

    // Validate configuration on scene creation
    validateGameConfig(GAME_CONFIG);

    // Initialize managers
    this.stationManager = new SpaceStationManager(this);
    this.effectsManager = new EffectsManager(this);
    this.uiManager = new UIManager(this);
    this.sceneConfigManager = new SceneConfigManager(this);
  }

  preload(): void {
    preloadPlayerAssets(this);

    // Load individual starbase images

    for (let i = 1; i <= 11; i++) {
      this.load.image(`starbase${i}`, `starbase${i}.png`);
    }

    // Load enemy ship asset (removed leading slash for GitHub Pages compatibility)
    this.load.image("enemy-ship", "assets/images/enemy-ship.png");

    // Load explosion sprite (note: file name is intentionally spelled as in asset path)
    this.load.image("enemy-explosion", "assets/images/emeny-explode.png");

    // Load hero explosion sprite
    this.load.image("hero-explosion", "assets/images/HeroShipExplodes.png");

    // Load laser sound effects for space combat
    this.load.audio("laserSound", "assets/sound/laser.mp3");
    this.load.audio("enemyLaserSound", "assets/sound/enemy_laser.mp3");

    // Add load event listeners for debugging
    // Intentionally silent

    this.load.on("filecomplete", (key: string) => {
      console.log("✅ Loaded:", key);
    });

    this.load.on("loaderror", (file: any) => {
      console.error("❌ Failed to load:", file.key, file.src);
    });
  }

  create(): void {
    // Initialize laser sound for space combat
    this.initializeLaserSound();

    // Initialize scene using functional approach
    this.initializeScene();

    // Setup modal event listeners
    this.setupModalEventListeners();

    // Global click detection
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Click detection for debugging if needed
    });

    // Mouse movement tracking
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      // Mouse movement tracking for debugging if needed
    });

    // Start this scene as the initial scene
    this.scene.setActive(true);
  }

  private initializeScene(): void {
    const { width, height } = this.scale;

    // Setup scene configuration
    this.sceneConfigManager.setupSpaceBackground();
    this.sceneConfigManager.ensureLaserTexture();
    this.sceneConfigManager.ensureEnemyLaserTexture();

    // Create player - start on right side, vertically centered
    this.state.player = createPlayer(this, width - 150, height / 2);
    // Set player depth to appear above other objects
    this.state.player.setDepth(10);
    // Set collision layer for player
    CollisionLayerHelper.setCollisionLayer(this.state.player, CollisionLayer.PLAYER_SHIP);

    // Prepare laser groups
    this.state.lasers = this.add.group();
    this.state.enemyLasers = this.add.group();

    // Initialize UI Manager
    this.uiManager.initialize(this.state.playerHealth, this.state.maxPlayerHealth);

    // Get UI element references from manager
    this.state.interactionPrompt = this.uiManager.getInteractionPrompt();
    this.xpText = this.uiManager.getXpText();

    // Initialize Space Station Manager
    this.stationManager.initialize(this.handleStationInteraction);

    // Initialize Enemy AI System
    this.state.enemyAI = new EnemyAISystem(this, this.state.shieldMapManager);
    this.state.enemyAI.initialize(this.state.enemyLasers);
    this.state.enemyAI.setPlayerTarget(this.state.player);
    this.state.enemyAI.setCombatEnabled(true); // Enable combat for enemy spawning on dock

    // No initial enemy spawn - enemies only spawn when docking with stations

    // Setup cleanup when scene is destroyed
    this.events.once("destroy", this.cleanup, this);

    // Initialize Shield Mapping System
    this.state.shieldMapManager = new ShieldMapManager(this);

    // Create shields for each station
    this.state.shields = this.add.group();
    const stationsData = this.stationManager.getStationsData();
    stationsData.forEach((station) => {
      const shield = createStationShield(this, station, station.x, station.y);
      this.state.shields!.add(shield);

      // Register shield with mapping system
      const shieldConfig: ShieldZoneConfig = {
        dockingRadius: SHIELD_CONFIG.geometry.dockingRadius, // Inner zone - allows ships to dock
        barrierRadius: SHIELD_CONFIG.geometry.barrierRadius, // Middle zone - blocks projectiles (matches visual shield)
        detectionRadius: SHIELD_CONFIG.geometry.detectionRadius, // Outer zone - early detection
        stationId: station.id,
        position: new Phaser.Math.Vector2(station.x, station.y),
        isActive: true,
      };
      this.state.shieldMapManager!.registerShield(station.id, shieldConfig);

      // Register station body as LOS occluder (radius approximates 60px for 120px display size)
      this.state.shieldMapManager!.registerStationOccluder(
        station.id,
        new Phaser.Math.Vector2(station.x, station.y),
        60,
      );
    });

    // Provide shield manager to Enemy AI (for LOS and avoidance)
    if (this.state.enemyAI && this.state.shieldMapManager) {
      this.state.enemyAI.setShieldManager(this.state.shieldMapManager);
    }

    // Setup controls
    this.setupControls();

    // Get remaining UI references we need
    this.state.healthText = this.uiManager.getHealthText();

    // Setup stations group reference for proximity detection
    this.state.spaceStations = this.stationManager.getStationsGroup();

    // Setup progression tracking
    this.state.totalStationCount = this.stationManager.getTotalStationCount();

    // Setup collision detection after AI system creates enemies
    this.setupEnemyCollisions();

    // Enemy laser vs Player collision detection
    if (this.state.enemyLasers && this.state.player) {
      this.physics.add.overlap(
        this.state.enemyLasers,
        this.state.player,
        this
          .handleEnemyLaserHitPlayer as unknown as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this,
      );
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
          this,
        );
      }

      // Enemy lasers vs shields
      if (this.state.enemyLasers) {
        this.physics.add.overlap(
          this.state.enemyLasers,
          this.state.shields,
          this.handleLaserShieldHit as unknown as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
          undefined,
          this,
        );
      }
    }

    // Enemy shield avoidance is now handled by the AI system
  }

  private initializeLaserSound(): void {
    try {
      // Get sound setting from GameUIScene
      const uiScene = this.scene.get("GameUIScene") as any;
      this.state.soundEnabled =
        uiScene && uiScene.soundEnabled !== undefined ? uiScene.soundEnabled : true;

      // Create player laser sound effect
      this.state.laserSound = this.sound.add("laserSound", {
        loop: false,
        volume: 0.4, // Slightly louder for impact
      });

      // Create enemy laser sound effect
      this.state.enemyLaserSound = this.sound.add("enemyLaserSound", {
        loop: false,
        volume: 0.3, // Slightly quieter for enemy attacks
      });
    } catch (error) {
      console.warn("[SkillSpaceScene] Error initializing laser sound:", error);
    }
  }

  public playLaserSound(): void {
    if (this.state.soundEnabled && this.state.laserSound) {
      try {
        this.state.laserSound.play();
      } catch (error) {
        console.warn("[SkillSpaceScene] Error playing laser sound:", error);
      }
    }
  }

  public playEnemyLaserSound(): void {
    if (this.state.soundEnabled && this.state.enemyLaserSound) {
      try {
        this.state.enemyLaserSound.play();
      } catch (error) {
        console.warn("[SkillSpaceScene] Error playing enemy laser sound:", error);
      }
    }
  }

  // Handler methods for interactions
  private dockWithStation = (station: Phaser.GameObjects.GameObject, skillId: string): void => {
    if (!this.state.player || this.state.isDocking) return;

    this.state.isDocking = true;

    // Get station position
    const stationX = (station as any).x;
    const stationY = (station as any).y;

    // Update interaction prompt
    if (this.state.interactionPrompt) {
      this.state.interactionPrompt.setText("Docking...");
    }

    // Animate ship to station center
    this.tweens.add({
      targets: this.state.player,
      x: stationX,
      y: stationY,
      duration: 800,
      ease: "Power2.easeInOut",
      onComplete: () => {
        // Station docking animation
        this.tweens.add({
          targets: station,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          yoyo: true,
          ease: "Power2",
          onComplete: () => {
            // Complete docking sequence
            this.state.isDocking = false;
            this.state.isDocked = true;
            this.state.dockedStation = station;

            // Award XP for successful docking
            this.uiManager.addXp(COMBAT_CONFIG.xp.stationDockReward);
            this.effectsManager.animateXpGain(COMBAT_CONFIG.xp.stationDockReward, this.xpText!);

            // Also emit event for GameUIScene
            gameEventBridge.emitGameEvent("game:xp-changed", {
              amount: COMBAT_CONFIG.xp.stationDockReward,
              total: this.uiManager.getXpTotal(),
            });

            // Mark station unlocked and emit event
            const stationData = station.getData("stationData");
            const stationId = stationData?.id as string | undefined;
            if (stationId) {
              this.state.unlockedStations?.add(stationId);
              const totalUnlocked = this.state.unlockedStations?.size || 0;
              const totalStations = this.state.totalStationCount || 0;
              gameEventBridge.emitGameEvent("game:station-unlocked", {
                stationId,
                skillId,
                totalUnlocked,
                totalStations,
              });

              // Check completion
              if (totalStations > 0 && totalUnlocked >= totalStations) {
                gameEventBridge.emitGameEvent("game:progress-complete", { totalStations });
              }
            }

            if (this.state.interactionPrompt) {
              this.state.interactionPrompt.setText("Docked! Press D to undock");
              this.state.interactionPrompt.setVisible(true);
            }

            // Emit skill selected event with station data for radar centering
            const currentStationData = station.getData("stationData");
            const stationDataForRadar = {
              id: currentStationData.id,
              x: currentStationData.x,
              y: currentStationData.y,
              name: currentStationData.name,
            };
            console.log(
              "🎯 RADAR DEBUG: Emitting skill-selected with station data:",
              stationDataForRadar,
            );
            gameEventBridge.emitGameEvent("game:skill-selected", {
              skillId,
              stationData: stationDataForRadar,
            });

            // Spawn enemies on dock (instead of undock) so they appear on radar while docked
            // Spawn +3 enemies once per unlocked station upon docking (only if combat enabled)
            if (this.state.enemyAI && this.state.combatEnabled) {
              const alreadySpawned = stationId && this.state.dockSpawnedForStation?.has(stationId);
              if (stationId && !alreadySpawned) {
                // Prefer outside random spawns so ships fly in from offscreen
                if (typeof this.state.enemyAI.spawnFromOutsideRandom === "function") {
                  this.state.enemyAI.spawnFromOutsideRandom(3);
                } else {
                  this.state.enemyAI.spawnWave(3);
                }
                this.state.dockSpawnedForStation?.add(stationId);
              }
            }
          },
        });
      },
    });
  };

  private undockFromStation = (): void => {
    if (!this.state.player || !this.state.isDocked) return;

    this.state.isDocked = false;
    this.state.dockedStation = null;

    if (this.state.interactionPrompt) {
      this.state.interactionPrompt.setVisible(false);
    }

    // Enemy spawning now happens on dock (not undock) so they appear on radar while docked
  };

  private handleStationInteraction = (skillId: string, stationData: any): void => {
    const stationDataForRadar = {
      id: stationData.id,
      x: stationData.x,
      y: stationData.y,
      name: stationData.name,
    };
    console.log(
      "🎯 RADAR DEBUG: handleStationInteraction emitting with station data:",
      stationDataForRadar,
    );
    gameEventBridge.emitGameEvent("game:skill-selected", {
      skillId,
      stationData: stationDataForRadar,
    });
  };

  private setupControls(): void {
    this.state.cursors = this.input.keyboard!.createCursorKeys();

    const keyD = this.input.keyboard!.addKey("D");
    const keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Laser hold-to-fire: SPACE down starts repeat; up stops
    keySpace.on("down", () => {
      if (this.state.laserTimer) {
        this.state.laserTimer.remove(false);
        this.state.laserTimer = null;
      }
      this.fireLasersAtEnemy();
      this.state.laserTimer = this.time.addEvent({
        delay: COMBAT_CONFIG.laser.fireRepeatMs,
        loop: true,
        callback: () => this.fireLasersAtEnemy(),
      });
    });

    keySpace.on("up", () => {
      if (this.state.laserTimer) {
        this.state.laserTimer.remove(false);
        this.state.laserTimer = null;
      }
    });

    // D for docking/interaction
    keyD.on("down", () => {
      // Priority 1: Close modal and undock if modal is open
      if (this.state.isModalOpen) {
        gameEventBridge.emitGameEvent("ui:setting-changed", { key: "closeModal", value: true });
        if (this.state.isDocked) {
          this.undockFromStation();
        }
        return;
      }
      if (this.state.isDocking) return;
      if (this.state.isDocked) {
        this.undockFromStation();
        return;
      }
      if (this.state.nearestStation) {
        const stationData = this.state.nearestStation.getData("stationData");
        if (stationData) {
          // Prevent docking if shields are up for this station
          const shieldActive = this.state.shieldMapManager
            ?.getShieldForStation(stationData.id)
            ?.getConfig().isActive;
          if (shieldActive) {
            if (this.state.interactionPrompt) {
              this.state.interactionPrompt.setText("Shields up — docking disabled");
              this.state.interactionPrompt.setVisible(true);
            }
            return;
          }
          this.dockWithStation(this.state.nearestStation, stationData.skillId);
        }
      }
    });
  }

  private setupModalEventListeners(): void {
    // Listen for modal opened/closed events to track state
    gameEventBridge.onGameEvent("ui:modal-opened", () => {
      this.state.isModalOpen = true;
    });

    gameEventBridge.onGameEvent("ui:modal-closed", () => {
      this.state.isModalOpen = false;
    });

    // Listen for combat toggle
    gameEventBridge.onGameEvent("ui:setting-changed", (data) => {
      if (data.key === "combatEnabled") {
        const newCombatState = data.value as boolean;
        const previousState = this.state.combatEnabled;
        this.state.combatEnabled = newCombatState;

        if (this.state.enemyAI) {
          this.state.enemyAI.setCombatEnabled(newCombatState);

          if (newCombatState && !previousState) {
            // Combat turned ON: enemies will spawn when docking with stations
            // No automatic spawning here
          } else if (!newCombatState && previousState) {
            // Combat turned OFF: despawn all enemies and clear enemy lasers
            this.state.enemyAI.despawnAll();
            if (this.state.enemyLasers) {
              this.state.enemyLasers.clear(true, true);
            }
          }
        }
      }
    });
  }

  private cleanup(): void {
    // Clean up timers
    if (this.state.laserTimer) {
      this.state.laserTimer.remove(false);
      this.state.laserTimer = null;
    }
  }

  // setupUI method removed - now handled by UIManager

  update(): void {
    if (!this.state.player || !this.state.cursors) return;

    // Only allow movement if not docking or docked
    if (!this.state.isDocking && !this.state.isDocked) {
      // Handle player movement using functional approach
      updatePlayerVelocity(this.state.player, this.state.cursors, this.input.keyboard!);

      // Enforce shield barrier for player ship
      this.enforceShieldBarrierForSprite(this.state.player, CollisionLayer.PLAYER_SHIP);

      // Check for station proximity
      this.updateStationProximity();
    }

    // Update enemy AI system
    if (this.state.enemyAI) {
      this.state.enemyAI.updateAll(this.time.now, this.game.loop.delta);
    }

    // Cleanup lasers after lifetime
    if (this.state.lasers) {
      const now = this.time.now;
      this.state.lasers.children.each((laserObj: Phaser.GameObjects.GameObject) => {
        const createdAt = laserObj.getData("createdAt") as number | undefined;
        if (createdAt && now - createdAt > COMBAT_CONFIG.laser.lifetimeMs) {
          laserObj.destroy();
        }
        return null;
      }, this);
    }

    // Cleanup enemy lasers after lifetime
    if (this.state.enemyLasers) {
      const now = this.time.now;
      this.state.enemyLasers.children.each((laserObj: Phaser.GameObjects.GameObject) => {
        const createdAt = laserObj.getData("createdAt") as number | undefined;
        if (createdAt && now - createdAt > COMBAT_CONFIG.laser.lifetimeMs) {
          laserObj.destroy();
        }
        return null;
      }, this);
    }

    // Regenerate shields
    this.regenerateShields();
  }

  private updateStationProximity(): void {
    if (!this.state.spaceStations || !this.state.player || !this.state.interactionPrompt) return;

    const stations = this.state.spaceStations.children.entries as Phaser.GameObjects.GameObject[];
    const nearestStation = findNearestObject(
      this.state.player,
      stations,
      UI_CONFIG.proximity.stationDetectionDistance,
    );

    // If any shield is active for the nearest station, prevent docking prompt
    if (nearestStation && this.state.shieldMapManager) {
      const stationData = nearestStation.getData("stationData");
      const shieldSystem = this.state.shieldMapManager.getShieldForStation(stationData?.id);
      if (shieldSystem && shieldSystem.getConfig().isActive) {
        this.state.interactionPrompt.setText("Shields up — docking disabled");
        this.state.interactionPrompt.setVisible(true);
        this.state.nearestStation = null;
        return;
      }
    }

    if (nearestStation !== this.state.nearestStation) {
      this.state.nearestStation = nearestStation;

      if (this.state.nearestStation) {
        const stationData = this.state.nearestStation.getData("stationData");
        this.state.interactionPrompt.setText(
          `Press D to dock with ${stationData.name.replace("\n", " ")}`,
        );
        this.state.interactionPrompt.setVisible(true);
      } else {
        this.state.interactionPrompt.setVisible(false);
      }
    }
  }

  private fireLasersAtEnemy = (): void => {
    if (!this.state.player) return;

    const player = this.state.player;

    // Play laser sound effect for player firing
    this.playLaserSound();

    const wingOffsetsLocal = [new Phaser.Math.Vector2(-18, 18), new Phaser.Math.Vector2(18, 18)];

    const rotation = player.rotation;

    // Forward vector for a sprite that faces up by default
    const forward = new Phaser.Math.Vector2(Math.sin(rotation), -Math.cos(rotation)).normalize();

    wingOffsetsLocal.forEach((offset) => {
      const rotated = offset.clone().rotate(rotation);
      const spawnX = player.x + rotated.x;
      const spawnY = player.y + rotated.y;

      const laser = this.add.sprite(spawnX, spawnY, "laser-beam");
      laser.setBlendMode(Phaser.BlendModes.ADD);
      laser.setDepth(9);
      this.physics.add.existing(laser);
      laser.setData("createdAt", this.time.now);
      laser.setData("isPlayerLaser", true);
      CollisionLayerHelper.setCollisionLayer(laser, CollisionLayer.PLAYER_LASER);

      const body = laser.body as Phaser.Physics.Arcade.Body;
      body.setAllowRotation(true);

      const speed = COMBAT_CONFIG.laser.speedPxPerSecond;
      body.setVelocity(forward.x * speed, forward.y * speed);

      // Align laser orientation with player's facing
      laser.rotation = rotation;

      this.state.lasers!.add(laser);
    });
  };

  private handleLaserEnemyOverlap = (
    laserObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject,
  ): void => {
    const enemy = enemyObj as Phaser.GameObjects.Sprite;
    const laser = laserObj as Phaser.GameObjects.Sprite;
    if (!enemy || !laser) return;
    if (enemy.getData("isDead")) return;
    enemy.setData("isDead", true);

    this.effectsManager.spawnExplosionAt(enemy.x, enemy.y);

    // Award XP for enemy kill
    this.uiManager.addXp(COMBAT_CONFIG.xp.enemyKillReward);
    this.effectsManager.animateXpGain(COMBAT_CONFIG.xp.enemyKillReward, this.xpText!);

    // Also emit event for GameUIScene (if it's working)
    gameEventBridge.emitGameEvent("game:xp-changed", {
      amount: COMBAT_CONFIG.xp.enemyKillReward,
      total: this.uiManager.getXpTotal(),
    });

    // Remove enemy from AI system
    if (this.state.enemyAI) {
      const agent = this.state.enemyAI.getAgentBySprite(enemy);
      if (agent) {
        this.state.enemyAI.removeEnemy(agent.id);
      }
    }

    laser.destroy();
  };

  // Explosion methods moved to EffectsManager

  // Enemy firing is now handled by the AI system

  private handleEnemyLaserHitPlayer = (
    enemyLaserObj: Phaser.GameObjects.GameObject,
    playerObj: Phaser.GameObjects.GameObject,
  ): void => {
    const laser = enemyLaserObj as Phaser.GameObjects.Sprite;
    if (laser && laser.active) laser.destroy();
    const player = playerObj as Phaser.GameObjects.Sprite;
    if (!player) return;
    this.damagePlayer(1);
  };

  private updateHealthUI(): void {
    if (!this.state.healthText) return;
    this.state.healthText.setText(
      `Health: ${this.state.playerHealth}/${this.state.maxPlayerHealth}`,
    );
  }

  // private updateXpUI(): void {
  //   if (!this.xpText) return
  //   this.xpText.setText(`XP: ${this.xpTotal}`)
  // }

  // animateXpGain method moved to EffectsManager

  private damagePlayer(amount: number): void {
    if (!this.state.player) return;
    if (this.state.isPlayerInvulnerable) return;

    this.state.playerHealth = Math.max(0, this.state.playerHealth - amount);
    this.updateHealthUI();

    // Feedback: explosion and invulnerability window (no flash)
    this.effectsManager.spawnHeroExplosionAt(this.state.player.x, this.state.player.y);
    this.state.isPlayerInvulnerable = true;
    this.time.delayedCall(PLAYER_CONFIG.health.invulnerabilityDurationMs, () => {
      this.state.isPlayerInvulnerable = false;
    });

    // If health depleted, soften controls feedback (no hard game over yet)
    if (this.state.playerHealth <= 0) {
      // Optional: further feedback; currently just ensures invulnerability window
    }
  }

  private handleLaserShieldHit = (
    laserObj: Phaser.GameObjects.GameObject,
    shieldObj: Phaser.GameObjects.GameObject,
  ): void => {
    const laser = laserObj as Phaser.GameObjects.Sprite;
    const shield = shieldObj as Phaser.GameObjects.Container;

    if (!laser || !shield) return;

    const shieldConfig = shield.getData("shieldConfig") as ShieldConfig;
    if (!shieldConfig || !shieldConfig.isActive) return;

    // Destroy the laser
    laser.destroy();

    // Damage the shield
    this.damageShield(shield, 1);

    // Create hit effect at impact point
    this.effectsManager.createShieldHitEffect(laser.x, laser.y, shieldConfig.color);
  };

  private damageShield(shield: Phaser.GameObjects.Container, damage: number): void {
    const shieldConfig = shield.getData("shieldConfig") as ShieldConfig;
    if (!shieldConfig || !shieldConfig.isActive) return;

    shieldConfig.health = Math.max(0, shieldConfig.health - damage);
    shieldConfig.lastHitTime = this.time.now;

    // Update shield visuals based on health
    this.updateShieldVisuals(shield);

    // If shield is destroyed, deactivate it
    if (shieldConfig.health <= 0) {
      shieldConfig.isActive = false;
      shield.setVisible(false);

      const body = shield.body as Phaser.Physics.Arcade.StaticBody;
      if (body) {
        body.enable = false;
      }

      // Update mapping system (shield offline)
      if (this.state.shieldMapManager) {
        this.state.shieldMapManager.updateShieldState(shieldConfig.stationId, false);
      }

      // Create shield destruction effect
      this.effectsManager.createShieldDestructionEffect(shield.x, shield.y, shieldConfig.color);
    }

    // Update the shield config data
    shield.setData("shieldConfig", shieldConfig);
  }

  private updateShieldVisuals(shield: Phaser.GameObjects.Container): void {
    const shieldConfig = shield.getData("shieldConfig") as ShieldConfig;
    const shieldSprite = shield.getData("shieldSprite") as Phaser.GameObjects.Image;

    if (!shieldConfig || !shieldSprite) return;

    const healthPercent = shieldConfig.health / shieldConfig.maxHealth;
    let state: "healthy" | "damaged" | "critical";

    if (healthPercent > 0.66) {
      state = "healthy";
    } else if (healthPercent > 0.33) {
      state = "damaged";
    } else {
      state = "critical";
    }

    // Update texture based on shield state
    const newTexture = createShieldTexture(this, shieldConfig.color, state);
    shieldSprite.setTexture(newTexture);
  }

  private regenerateShields(): void {
    if (!this.state.shields) return;

    const currentTime = this.time.now;

    this.state.shields.children.each((shieldObj: Phaser.GameObjects.GameObject) => {
      const shield = shieldObj as Phaser.GameObjects.Container;
      const shieldConfig = shield.getData("shieldConfig") as ShieldConfig;

      if (!shieldConfig) return null;

      const timeSinceLastHit = currentTime - (shieldConfig.lastHitTime || 0);

      // Start regenerating after configured delay
      if (
        shieldConfig.health < shieldConfig.maxHealth &&
        timeSinceLastHit >= SHIELD_CONFIG.health.regenerationDelayMs
      ) {
        const timeSinceLastRegen = currentTime - (shieldConfig.lastRegenTime || 0);
        if (timeSinceLastRegen >= shieldConfig.regenerationRate) {
          const wasInactive = !shieldConfig.isActive;
          shieldConfig.health = Math.min(shieldConfig.maxHealth, shieldConfig.health + 1);
          shieldConfig.lastRegenTime = currentTime;

          // Reactivate on first regen point
          if (wasInactive && shieldConfig.health > 0) {
            shieldConfig.isActive = true;
            shield.setVisible(true);
            const body = shield.body as Phaser.Physics.Arcade.StaticBody;
            if (body) {
              body.enable = true;
            }

            // Update mapping system (shield online)
            if (this.state.shieldMapManager) {
              this.state.shieldMapManager.updateShieldState(shieldConfig.stationId, true);
            }

            this.effectsManager.createShieldReactivationEffect(
              shield.x,
              shield.y,
              shieldConfig.color,
            );
          }

          // Update visuals on each regen tick
          this.updateShieldVisuals(shield);

          shield.setData("shieldConfig", shieldConfig);
        }
      }
      return null;
    }, this);
  }

  // Shield effect methods moved to EffectsManager

  // Enemy barrier enforcement is now handled by the AI system

  private setupEnemyCollisions(): void {
    // Setup collision detection between player lasers and enemy sprites
    if (this.state.lasers && this.state.enemyAI) {
      // We need to manually check collisions each frame since enemies are not in a group
      this.time.addEvent({
        delay: COMBAT_CONFIG.collision.checkIntervalMs, // Check every frame (roughly 60 FPS)
        loop: true,
        callback: () => {
          // Skip collision detection when combat is disabled
          if (!this.state.combatEnabled || !this.state.lasers || !this.state.enemyAI) return;

          const activeEnemies = this.state.enemyAI.getActiveAgents();
          this.state.lasers.children.each((laserObj: Phaser.GameObjects.GameObject) => {
            const laser = laserObj as Phaser.GameObjects.Sprite;
            if (!laser || !laser.active) return null;

            for (const enemy of activeEnemies) {
              if (!enemy.sprite || !enemy.sprite.active) continue;

              // Check if laser and enemy overlap
              const distance = Phaser.Math.Distance.Between(
                laser.x,
                laser.y,
                enemy.sprite.x,
                enemy.sprite.y,
              );

              if (distance < COMBAT_CONFIG.collision.threshold) {
                // Collision threshold
                this.handleLaserEnemyOverlap(laser, enemy.sprite);
                break; // Stop checking after first collision
              }
            }
            return null;
          }, this);
        },
      });
    }
  }

  private enforceShieldBarrierForSprite(
    sprite: Phaser.GameObjects.Sprite,
    layer: CollisionLayer,
  ): void {
    if (!this.state.shieldMapManager) return;
    const position = new Phaser.Math.Vector2(sprite.x, sprite.y);
    const blocking = this.state.shieldMapManager.getBlockingCollision(position, layer);
    if (!blocking || !blocking.zone) return;

    // Compute push-out vector from shield center and clamp to just outside barrier radius
    const shieldConfig = this.state.shieldMapManager
      .getShieldForStation(blocking.stationId)!
      .getConfig();
    const center = shieldConfig.position;
    const toSprite = position.clone().subtract(center);
    const currentDistance = Math.max(toSprite.length(), 0.0001);

    const minDistance =
      blocking.zone === "BARRIER"
        ? shieldConfig.barrierRadius + 2
        : blocking.zone === "DOCKING"
          ? shieldConfig.dockingRadius + 2
          : shieldConfig.detectionRadius + 2;

    if (currentDistance < minDistance) {
      const corrected = toSprite.scale(minDistance / currentDistance);
      sprite.x = center.x + corrected.x;
      sprite.y = center.y + corrected.y;

      const body = sprite.body as Phaser.Physics.Arcade.Body;
      if (body) {
        // Damp and redirect velocity outward
        const outward = corrected.clone().normalize().scale(120);
        body.setVelocity(outward.x, outward.y);
      }
    }
  }
}
