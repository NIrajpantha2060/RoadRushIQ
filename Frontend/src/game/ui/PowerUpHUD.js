/**
 * PowerUpHUD.js
 *
 * Draws the power-up status widget inside the Phaser canvas (via UIScene).
 * Keeps all power-up visual feedback in one place, out of UIScene's main code.
 *
 * Shows:
 *   - Power label (e.g. "SHIELD")
 *   - Duration bar (drains while active)
 *   - Cooldown arc (fills while cooling down)
 *   - READY indicator when idle
 *   - [SPACE] hint
 *
 * UIScene calls:
 *   hud.onPowerUpdate(data)  — from 'powerup-update' game event
 *   hud.destroy()            — on game over / reset
 */

export default class PowerUpHUD {
  /**
   * @param {Phaser.Scene} uiScene  – the UIScene instance
   */
  constructor(uiScene) {
    this.scene  = uiScene;
    this._data  = null;   // latest powerup-update payload
    this._items = [];     // all display objects (for easy destroy)

    const W = uiScene.scale.width;
    const H = uiScene.scale.height;

    // Position: bottom-left corner, above the road edge
    this._x = 18;
    this._y = H - 90;

    this._gfx = uiScene.add.graphics().setDepth(25).setScrollFactor(0);
    this._items.push(this._gfx);

    // Label text  (e.g. "SHIELD")
    this._labelText = uiScene.add.text(this._x + 36, this._y - 10, '', {
      fontSize:   '11px',
      fontFamily: 'system-ui, sans-serif',
      fontStyle:  'bold',
      color:      '#ffffff',
    }).setOrigin(0, 0.5).setDepth(26).setScrollFactor(0);
    this._items.push(this._labelText);

    // Status text (timer / READY / COOLDOWN)
    this._statusText = uiScene.add.text(this._x + 36, this._y + 8, '', {
      fontSize:   '10px',
      fontFamily: 'system-ui, sans-serif',
      color:      'rgba(255,255,255,0.55)',
    }).setOrigin(0, 0.5).setDepth(26).setScrollFactor(0);
    this._items.push(this._statusText);

    // SPACE hint
    this._hintText = uiScene.add.text(this._x, this._y + 26, '[SPACE]', {
      fontSize:   '9px',
      fontFamily: 'system-ui, sans-serif',
      color:      'rgba(255,255,255,0.28)',
    }).setOrigin(0, 0.5).setDepth(26).setScrollFactor(0);
    this._items.push(this._hintText);

    // Start hidden
    this._setVisible(false);
  }

  /** Called by UIScene when 'powerup-update' fires */
  onPowerUpdate(data) {
    this._data = data;
    this._setVisible(true);
    this._render(data);
  }

  /** Called by UIScene on game-over reset */
  destroy() {
    for (const item of this._items) item?.destroy();
    this._items = [];
    this._gfx   = null;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _render(data) {
    if (!this._gfx) return;

    const g     = this._gfx;
    const x     = this._x;
    const y     = this._y;
    const color = data.color;

    g.clear();

    // ── Icon circle background ─────────────────────────────────────────────
    g.fillStyle(0x0d1220, 0.85);
    g.fillCircle(x + 14, y, 14);

    if (data.state === 'active') {
      // Glowing circle when active
      g.lineStyle(2.5, color, 0.9);
      g.strokeCircle(x + 14, y, 14);

      // Arc draining clockwise (duration remaining)
      g.lineStyle(3, color, 0.4);
      const startAngle = -Math.PI / 2;
      const endAngle   = startAngle + data.activeProgress * Math.PI * 2;
      g.beginPath();
      g.arc(x + 14, y, 14, startAngle, endAngle, false);
      g.strokePath();

      // Power icon: ⚡ (lightning bolt shape via graphics)
      this._drawPowerIcon(g, x + 14, y, color, 1.0);

      // Duration bar below icon
      this._drawBar(g, x, y + 20, 90, data.activeProgress, color, 0.85);

      // Texts
      this._labelText.setText(data.label);
      this._labelText.setColor('#' + color.toString(16).padStart(6, '0'));
      this._statusText.setText(`${data.activeSecondsLeft}s`);
      this._hintText.setAlpha(0);

    } else if (data.state === 'cooldown') {
      // Dim circle on cooldown
      g.lineStyle(1.5, color, 0.25);
      g.strokeCircle(x + 14, y, 14);

      // Filling arc (cooldown progress)
      g.lineStyle(2.5, color, 0.6);
      const startAngle = -Math.PI / 2;
      const endAngle   = startAngle + data.cooldownProgress * Math.PI * 2;
      g.beginPath();
      g.arc(x + 14, y, 14, startAngle, endAngle, false);
      g.strokePath();

      this._drawPowerIcon(g, x + 14, y, color, 0.25);

      // Texts
      this._labelText.setText(data.label);
      this._labelText.setColor('rgba(255,255,255,0.4)');
      this._statusText.setText(`${data.cooldownSecondsLeft}s`);
      this._hintText.setAlpha(0);

    } else {
      // IDLE / READY
      g.lineStyle(1.5, color, 0.65);
      g.strokeCircle(x + 14, y, 14);
      this._drawPowerIcon(g, x + 14, y, color, 0.85);

      this._labelText.setText(data.label);
      this._labelText.setColor('#' + color.toString(16).padStart(6, '0'));
      this._statusText.setText('READY');
      this._statusText.setStyle({ color: 'rgba(255,255,255,0.55)' });
      this._hintText.setAlpha(0.7);
    }
  }

  _drawBar(g, x, y, width, progress, color, alpha) {
    // Background track
    g.fillStyle(0x1a1a2e, 0.8);
    g.fillRoundedRect(x, y, width, 5, 2);

    // Fill
    g.fillStyle(color, alpha);
    g.fillRoundedRect(x, y, Math.max(width * progress, 2), 5, 2);
  }

  _drawPowerIcon(g, cx, cy, color, alpha) {
    // Simple lightning bolt / star shape — works for any power
    g.fillStyle(color, alpha);
    // Mini lightning bolt
    g.fillTriangle(cx - 3, cy - 7, cx + 5, cy - 7, cx, cy + 1);
    g.fillTriangle(cx - 5, cy + 7, cx + 3, cy + 7, cx, cy - 1);
  }

  _setVisible(v) {
    if (this._labelText) this._labelText.setVisible(v);
    if (this._statusText) this._statusText.setVisible(v);
    if (this._hintText)  this._hintText.setVisible(v);
    if (this._gfx)       this._gfx.setVisible(v);
  }
}