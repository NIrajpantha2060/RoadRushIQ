/**
 * MagnetPower.js
 *
 * Power-up: Magnet (used by Kross Fire)
 * - Attracts nearby gold coins toward the player automatically
 * - Radius is calculated dynamically to cover the FULL road width
 *   (all 3 lanes in OneWayScene, all 4 lanes in GameScene)
 * - Only affects scene._coins — NPCs are completely unaffected
 * - Draws a yellow attraction field around the bike
 * - Works identically in both GameScene (4 lanes) and OneWayScene (3 lanes)
 */

export default class MagnetPower {
  constructor(scene, options = {}) {
    this.scene    = scene;
    this.strength = options.strength ?? 320;

    // radius is computed in activate() from live scene geometry
    // options.radiusMultiplier lets BikeConfig fine-tune the overshoot
    this._radiusMultiplier = options.radiusMultiplier ?? 1.15;

    this._fieldGfx   = null;
    this._fieldAngle = 0;
    this._radius     = 180; // overwritten in activate()
  }

  activate() {
    const scene = this.scene;

    // ── Compute radius to cover the full road width ───────────────────────
    // scene.roadWidth is set in both GameScene and OneWayScene create().
    // Half the road width + 15% overshoot ensures coins in edge lanes
    // are always attracted even when the player is at the opposite edge.
    if (scene.roadWidth) {
      this._radius = (scene.roadWidth / 2) * this._radiusMultiplier;
    } else {
      // Fallback if roadWidth isn't available yet
      this._radius = (scene.scale.width * 0.80 / 2) * this._radiusMultiplier;
    }

    // Field visual
    this._fieldGfx = scene.add.graphics().setDepth(8);

    // Burst ring on activation
    const bx   = scene.bike.x;
    const by   = scene.bike.y;
    const ring = scene.add.ellipse(bx, by, 10, 10, 0xf7c948, 0.8).setDepth(15);
    scene.tweens.add({
      targets:  ring,
      scaleX:   (this._radius * 2) / 10,
      scaleY:   (this._radius * 2) / 10,
      alpha:    0,
      duration: 500,
      ease:     'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  update(delta) {
    const scene = this.scene;
    const bx    = scene.bike.x;
    const by    = scene.bike.y;
    const dt    = delta / 1000;

    this._fieldAngle += delta * 0.002;

    // ── Pull coins toward the bike ───────────────────────────────────────
    for (const coin of scene._coins) {
      if (coin.collected) continue;

      const dx   = bx - coin.gfx.x;
      const dy   = by - coin.gfx.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this._radius && dist > 1) {
        // Pull strength ramps up the closer the coin is
        const factor = 1 - dist / this._radius; // 0 at edge, 1 at centre
        const pull   = this.strength * (1 + factor * 1.5) * dt;
        const nx     = dx / dist;
        const ny     = dy / dist;

        coin.gfx.x += nx * Math.min(pull, dist);
        coin.gfx.y += ny * Math.min(pull, dist);
      }
    }

    // ── Draw attraction field ────────────────────────────────────────────
    if (this._fieldGfx) {
      this._fieldGfx.clear();

      // Outer dashed ring at full radius
      const segments = 20;
      for (let i = 0; i < segments; i++) {
        if (i % 2 === 0) continue; // skip alternating = dashed look
        const a1 = this._fieldAngle + (i / segments) * Math.PI * 2;
        const a2 = this._fieldAngle + ((i + 1) / segments) * Math.PI * 2;
        this._fieldGfx.lineStyle(1.5, 0xf7c948, 0.20);
        this._fieldGfx.beginPath();
        this._fieldGfx.arc(bx, by, this._radius, a1, a2, false);
        this._fieldGfx.strokePath();
      }

      // Middle ring at half-radius
      this._fieldGfx.lineStyle(1, 0xf7c948, 0.10);
      this._fieldGfx.strokeEllipse(bx, by, this._radius, this._radius);

      // Rotating inward-pointing attraction lines
      for (let i = 0; i < 8; i++) {
        const angle  = -this._fieldAngle * 1.2 + (i * Math.PI * 2) / 8;
        const startR = 24;
        const endR   = 55 + Math.sin(this._fieldAngle * 3 + i) * 18;
        const alpha  = 0.22 + Math.sin(this._fieldAngle * 2 + i) * 0.10;
        this._fieldGfx.lineStyle(1.2, 0xf7c948, alpha);
        this._fieldGfx.beginPath();
        this._fieldGfx.moveTo(bx + Math.cos(angle) * startR, by + Math.sin(angle) * startR);
        this._fieldGfx.lineTo(bx + Math.cos(angle) * endR,   by + Math.sin(angle) * endR);
        this._fieldGfx.strokePath();
      }

      // Gold dot at centre
      this._fieldGfx.fillStyle(0xf7c948, 0.5);
      this._fieldGfx.fillCircle(bx, by, 5);
    }
  }

  deactivate() {
    if (this._fieldGfx) {
      this._fieldGfx.destroy();
      this._fieldGfx = null;
    }
  }

  destroy() {
    this.deactivate();
  }
}