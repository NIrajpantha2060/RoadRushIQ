/**
 * ShieldPower.js
 *
 * Power-up: Shield (used by Aveengeer)
 * - Makes the player invincible for `duration` ms
 * - Adds a speed boost while active
 * - Draws a cyan shield aura around the bike
 * - Removes the aura and speed boost on deactivate
 */

export default class ShieldPower {
  constructor(scene, options = {}) {
    this.scene       = scene;
    this.speedBoost  = options.speedBoost ?? 80;
    this._aura       = null;
    this._auraOuter  = null;
    this._auraAngle  = 0;
  }

  // Called once when SPACE is pressed and power activates
  activate() {
    const scene = this.scene;

    // Flag read by _checkCollisions to skip crash
    scene.shieldActive = true;

    // Apply speed boost
    this._originalMaxSpeed = scene._shieldSpeedBoost ?? 0;
    scene._shieldSpeedBoost = this.speedBoost;

    // Draw shield aura — outer glow ring
    this._auraOuter = scene.add.ellipse(
      scene.bike.x, scene.bike.y,
      70, 80, 0x00c3ff, 0.12
    ).setDepth(9);

    // Inner animated ring
    this._aura = scene.add.graphics().setDepth(11);

    // Speed trail graphics layer (above road, below HUD)
    this._trail = scene.add.graphics().setDepth(8);
  }

  // Called every frame while shield is active
  update(delta) {
    const scene = this.scene;
    const bx    = scene.bike.x;
    const by    = scene.bike.y;

    this._auraAngle += delta * 0.003;

    // Apply speed boost additively each frame
    // (capped by scene MAX_SPEED — we don't change that constant)
    const boostedSpeed = scene.speed + this.speedBoost;
    // We don't override scene.speed directly — instead _checkTrafficSpeed
    // uses scene._shieldSpeedBoost which _updateTraffic adds in.
    // (See scene integration note — speed boost is visual via faster traffic)

    // Reposition outer glow to follow bike
    if (this._auraOuter) {
      this._auraOuter.x = bx;
      this._auraOuter.y = by;
      // Pulse the outer glow
      const pulse = 0.08 + Math.sin(this._auraAngle * 2) * 0.06;
      this._auraOuter.setAlpha(pulse);
    }

    // Redraw rotating shield ring
    if (this._aura) {
      this._aura.clear();

      // Outer ring
      this._aura.lineStyle(2.5, 0x00c3ff, 0.75);
      this._aura.strokeEllipse(bx, by, 64, 76);

      // Inner ring (counter-rotate)
      this._aura.lineStyle(1.5, 0xffffff, 0.35);
      this._aura.strokeEllipse(bx, by, 52, 62);

      // Rotating arc segments
      for (let i = 0; i < 4; i++) {
        const angle  = this._auraAngle + (i * Math.PI) / 2;
        const ax     = bx + Math.cos(angle) * 32;
        const ay     = by + Math.sin(angle) * 38;
        this._aura.fillStyle(0x00c3ff, 0.9);
        this._aura.fillCircle(ax, ay, 3);
      }

      // Counter-rotating dots
      for (let i = 0; i < 3; i++) {
        const angle  = -this._auraAngle * 1.5 + (i * Math.PI * 2) / 3;
        const ax     = bx + Math.cos(angle) * 26;
        const ay     = by + Math.sin(angle) * 31;
        this._aura.fillStyle(0xffffff, 0.5);
        this._aura.fillCircle(ax, ay, 2);
      }
    }

    // Speed trail — short cyan streaks behind bike
    if (this._trail) {
      this._trail.clear();
      const trailAlpha = 0.18 + Math.sin(this._auraAngle * 3) * 0.08;
      this._trail.lineStyle(2, 0x00c3ff, trailAlpha);
      for (let i = 0; i < 5; i++) {
        const ox  = (i % 2 === 0 ? -1 : 1) * (8 + i * 4);
        const len = 20 + i * 9;
        this._trail.beginPath();
        this._trail.moveTo(bx + ox, by + 30);
        this._trail.lineTo(bx + ox, by + 30 + len);
        this._trail.strokePath();
      }
    }
  }

  // Called when duration expires
  deactivate() {
    const scene = this.scene;

    scene.shieldActive      = false;
    scene._shieldSpeedBoost = 0;

    if (this._aura)      { this._aura.destroy();      this._aura      = null; }
    if (this._auraOuter) { this._auraOuter.destroy();  this._auraOuter = null; }
    if (this._trail)     { this._trail.destroy();      this._trail     = null; }
  }

  // Called if the scene ends (crash / restart) while shield might be active
  destroy() {
    this.deactivate();
  }
}