import Phaser from "phaser";

export class EffectsManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create an enemy explosion effect at the specified coordinates
   */
  spawnExplosionAt(x: number, y: number): void {
    const explosion = this.scene.add.image(x, y, "enemy-explosion");
    explosion.setDepth(50);
    explosion.setBlendMode(Phaser.BlendModes.ADD);
    explosion.setDisplaySize(160, 160);
    explosion.setAlpha(0.9);

    this.scene.tweens.add({
      targets: explosion,
      scale: { from: 0.1, to: 0.5 },
      alpha: { from: 1, to: 0 },
      duration: 550,
      ease: "Cubic.Out",
      onComplete: () => explosion.destroy(),
    });
  }

  /**
   * Create a hero explosion effect at the specified coordinates
   */
  spawnHeroExplosionAt(x: number, y: number): void {
    const explosion = this.scene.add.image(x, y, "hero-explosion");
    explosion.setDepth(50);
    explosion.setBlendMode(Phaser.BlendModes.ADD);
    explosion.setDisplaySize(180, 180);
    explosion.setAlpha(1);

    this.scene.tweens.add({
      targets: explosion,
      scale: { from: 0.5, to: 1.0 },
      alpha: { from: 1, to: 0 },
      duration: 600,
      ease: "Cubic.Out",
      onComplete: () => explosion.destroy(),
    });
  }

  /**
   * Large ship destruction (shields down, lethal hull hit)
   */
  spawnHeroDeathExplosionAt(x: number, y: number): void {
    const explosion = this.scene.add.image(x, y, "hero-explosion");
    explosion.setDepth(55);
    explosion.setBlendMode(Phaser.BlendModes.ADD);
    explosion.setDisplaySize(260, 260);
    explosion.setAlpha(1);

    this.scene.tweens.add({
      targets: explosion,
      scale: { from: 0.25, to: 2.2 },
      alpha: { from: 1, to: 0 },
      duration: 880,
      ease: "Cubic.Out",
      onComplete: () => explosion.destroy(),
    });
  }

  /**
   * Create shield hit effect at impact point
   */
  createShieldHitEffect(x: number, y: number, color: number): void {
    // Create a particle burst effect at hit location
    const particles = this.scene.add.particles(x, y, "laser-beam", {
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: color,
      speed: { min: 50, max: 150 },
      lifespan: 300,
      quantity: 5,
    });

    // Clean up particles after animation
    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  /**
   * Create shield destruction effect with larger particle burst
   */
  createShieldDestructionEffect(x: number, y: number, color: number): void {
    // Create a larger particle burst for shield destruction
    const particles = this.scene.add.particles(x, y, "laser-beam", {
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: color,
      speed: { min: 100, max: 250 },
      lifespan: 600,
      quantity: 15,
    });

    this.scene.time.delayedCall(800, () => {
      particles.destroy();
    });
  }

  /**
   * Create shield reactivation effect with gentle reformation particles
   */
  createShieldReactivationEffect(x: number, y: number, color: number): void {
    // Create a gentle reformation effect
    const particles = this.scene.add.particles(x, y, "laser-beam", {
      scale: { start: 0.1, end: 0.4 },
      alpha: { start: 0.3, end: 0.8 },
      tint: color,
      speed: { min: 20, max: 80 },
      lifespan: 800,
      quantity: 10,
    });

    this.scene.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  /**
   * Create floating XP gain text effect
   */
  animateXpGain(amount: number, xpText: Phaser.GameObjects.Text): void {
    if (!xpText) return;

    // Scale animation for XP text
    this.scene.tweens.add({
      targets: xpText,
      scaleX: { from: 1, to: 1.3 },
      scaleY: { from: 1, to: 1.3 },
      duration: 200,
      yoyo: true,
      ease: "Back.easeOut",
    });

    // Floating +XP text
    const floatingText = this.scene.add
      .text(xpText.x + 80, xpText.y, `+${amount}`, {
        fontSize: "18px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        fontStyle: "bold",
        color: "#F1C40F",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setDepth(101);

    this.scene.tweens.add({
      targets: floatingText,
      y: floatingText.y - 40,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: "Power2.easeOut",
      onComplete: () => floatingText.destroy(),
    });
  }
}
