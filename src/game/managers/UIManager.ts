import Phaser from "phaser";
import { UI_CONFIG } from "../config";

export class UIManager {
  private scene: Phaser.Scene;
  private interactionPrompt: Phaser.GameObjects.Text | null = null;
  private healthText: Phaser.GameObjects.Text | null = null;
  private shieldText: Phaser.GameObjects.Text | null = null;
  private xpText: Phaser.GameObjects.Text | null = null;
  private xpTotal: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize all UI elements
   */
  initialize(
    playerHealth: number,
    maxPlayerHealth: number,
    playerShields: number = 0,
    maxPlayerShields: number = 0,
  ): void {
    this.setupInteractionPrompt();
    this.setupNavigationHints();
    this.setupHealthDisplay(playerHealth, maxPlayerHealth);
    this.setupShieldDisplay(playerShields, maxPlayerShields);
    this.setupXpDisplay();
  }

  /**
   * Get the interaction prompt text object
   */
  getInteractionPrompt(): Phaser.GameObjects.Text | null {
    return this.interactionPrompt;
  }

  /**
   * Get the XP text object for animations
   */
  getXpText(): Phaser.GameObjects.Text | null {
    return this.xpText;
  }

  /**
   * Get the health text object
   */
  getHealthText(): Phaser.GameObjects.Text | null {
    return this.healthText;
  }

  /**
   * Get the shield text object
   */
  getShieldText(): Phaser.GameObjects.Text | null {
    return this.shieldText;
  }

  /**
   * Update health display
   */
  updateHealth(currentHealth: number, maxHealth: number): void {
    if (this.healthText) {
      this.healthText.setText(`Health: ${currentHealth}/${maxHealth}`);
    }
  }

  /**
   * Update shield display
   */
  updateShields(currentShields: number, maxShields: number): void {
    if (this.shieldText) {
      this.shieldText.setText(`Shields: ${currentShields}/${maxShields}`);
    }
  }

  /**
   * Update XP total and display
   */
  updateXp(newTotal: number): void {
    this.xpTotal = newTotal;
    if (this.xpText) {
      this.xpText.setText(`XP: ${this.xpTotal}`);
    }
  }

  /**
   * Add XP to the current total
   */
  addXp(amount: number): void {
    this.xpTotal += amount;
    this.updateXp(this.xpTotal);
  }

  /**
   * Get current XP total
   */
  getXpTotal(): number {
    return this.xpTotal;
  }

  /**
   * Show portal interaction prompt
   */
  showPortalPrompt(portalName: string): void {
    if (this.interactionPrompt) {
      this.interactionPrompt.setText(`Press D to travel to ${portalName}`);
      this.interactionPrompt.setVisible(true);
    }
  }

  /**
   * Show station interaction prompt
   */
  showStationPrompt(stationName: string): void {
    if (this.interactionPrompt) {
      this.interactionPrompt.setText(`Press E to dock with ${stationName.replace("\n", " ")}`);
      this.interactionPrompt.setVisible(true);
    }
  }

  /**
   * Show docking prompt
   */
  showDockingPrompt(): void {
    if (this.interactionPrompt) {
      this.interactionPrompt.setText("Docking...");
      this.interactionPrompt.setVisible(true);
    }
  }

  /**
   * Show docked prompt
   */
  showDockedPrompt(): void {
    if (this.interactionPrompt) {
      this.interactionPrompt.setText("Docked! Press E to undock");
      this.interactionPrompt.setVisible(true);
    }
  }

  /**
   * Show shields up prompt
   */
  showShieldsUpPrompt(): void {
    if (this.interactionPrompt) {
      this.interactionPrompt.setText("Shields up — docking disabled");
      this.interactionPrompt.setVisible(true);
    }
  }

  /**
   * Hide interaction prompt
   */
  hidePrompt(): void {
    if (this.interactionPrompt) {
      this.interactionPrompt.setVisible(false);
    }
  }

  private setupInteractionPrompt(): void {
    this.interactionPrompt = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height - UI_CONFIG.positioning.interactionPrompt.yOffset,
        "",
        {
          fontSize: UI_CONFIG.fonts.promptSize,
          fontFamily: UI_CONFIG.fonts.primary,
          fontStyle: "bold",
          color: UI_CONFIG.colors.prompt,
          stroke: "#000000",
          strokeThickness: 2,
          backgroundColor: "#2C3E50ee",
          padding: { x: 12, y: 6 },
          resolution: 2,
        },
      )
      .setOrigin(0.5)
      .setVisible(false);
  }

  private setupNavigationHints(): void {
    this.scene.add.text(
      20,
      this.scene.scale.height - UI_CONFIG.positioning.navigationHints.yOffset,
      "WASD/Arrows: Navigate | Q/R: Rotate | SPACE: Fire lasers | E: Dock/Undock | H: Home",
      {
        fontSize: UI_CONFIG.fonts.hintsSize,
        color: UI_CONFIG.colors.hints,
      },
    );
  }

  private setupHealthDisplay(playerHealth: number, maxPlayerHealth: number): void {
    this.healthText = this.scene.add
      .text(UI_CONFIG.positioning.healthDisplay.x, UI_CONFIG.positioning.healthDisplay.y, "", {
        fontSize: UI_CONFIG.fonts.healthSize,
        fontFamily: UI_CONFIG.fonts.primary,
        fontStyle: "bold",
        color: UI_CONFIG.colors.health,
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setDepth(100);

    this.updateHealth(playerHealth, maxPlayerHealth);
  }

  private setupShieldDisplay(playerShields: number, maxPlayerShields: number): void {
    this.shieldText = this.scene.add
      .text(UI_CONFIG.positioning.shieldDisplay.x, UI_CONFIG.positioning.shieldDisplay.y, "", {
        fontSize: UI_CONFIG.fonts.shieldSize,
        fontFamily: UI_CONFIG.fonts.primary,
        fontStyle: "bold",
        color: UI_CONFIG.colors.shields,
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setDepth(100);

    this.updateShields(playerShields, maxPlayerShields);
  }

  private setupXpDisplay(): void {
    this.xpText = this.scene.add
      .text(UI_CONFIG.positioning.xpDisplay.x, UI_CONFIG.positioning.xpDisplay.y, "XP: 0", {
        fontSize: UI_CONFIG.fonts.xpSize,
        fontFamily: UI_CONFIG.fonts.primary,
        fontStyle: "bold",
        color: UI_CONFIG.colors.xp,
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setDepth(100);
  }
}
