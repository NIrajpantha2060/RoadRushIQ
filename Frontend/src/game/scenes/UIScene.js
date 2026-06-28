// /**
//  * UIScene.js — HUD + Game Over overlay
//  *
//  * Added: Blue Diamond + Red Diamond counters in HUD bar
//  */
// import Phaser from 'phaser';

// export default class UIScene extends Phaser.Scene {
//   constructor() {
//     super({ key: 'UIScene' });
//   }

//   create() {
//     const W = this.scale.width;
//     const H = this.scale.height;
//     this.W = W;
//     this.H = H;

//     this._gameOverShown = false;
//     this._overlayActive = false;

//     this.input.setTopOnly(true);
//     this._createHUD(W);
//     this.registry.events.on('changedata', this._onRegistryChange, this);

//     // Also listen for diamond updates emitted by IQBoxManager
//     this.game.events.on('hud-update', this._onHudUpdate, this);

//     this.scoreText.setText('0 m');
//     this.speedText.setText('0 km/h');
//     this.coinText.setText('0');
//     this.blueText.setText('0');
//     this.redText.setText('0');
//   }

//   _getGameSceneKey() {
//     for (const key of ['GameScene', 'OneWayScene']) {
//       if (this.scene.isActive(key) || this.scene.isPaused(key)) return key;
//     }
//     return null;
//   }

//   // ── HUD ──────────────────────────────────────────────────────────────────
//   _createHUD(W) {
//     const barH = 52;

//     this.add.rectangle(W / 2, barH / 2, W, barH, 0x000000, 0.60)
//       .setDepth(20).setScrollFactor(0);

//     // Speed — far left
//     this.speedText = this.add.text(12, barH / 2, '0 km/h', {
//       fontSize: '13px', fontFamily: 'system-ui, sans-serif',
//       color: 'rgba(255,255,255,0.65)',
//     }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

//     // Score — centre
//     this.scoreText = this.add.text(W / 2, barH / 2, '0 m', {
//       fontSize: '20px', fontFamily: 'system-ui, sans-serif',
//       fontStyle: 'bold', color: '#ffffff',
//     }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

//     // Right side cluster: 🪙 coins | 💎 blue | 💠 red
//     // Gold coin
//     this.add.circle(W - 178, barH / 2, 7, 0xf7c948).setDepth(21).setScrollFactor(0);
//     this.coinText = this.add.text(W - 167, barH / 2, '0', {
//       fontSize: '14px', fontFamily: 'system-ui, sans-serif',
//       fontStyle: 'bold', color: '#f7c948',
//     }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

//     // Separator
//     this.add.text(W - 132, barH / 2, '|', {
//       fontSize: '14px', color: 'rgba(255,255,255,0.2)',
//     }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

//     // Blue diamond
//     this.add.text(W - 122, barH / 2, '💎', { fontSize: '14px' })
//       .setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);
//     this.blueText = this.add.text(W - 104, barH / 2, '0', {
//       fontSize: '14px', fontFamily: 'system-ui, sans-serif',
//       fontStyle: 'bold', color: '#00c3ff',
//     }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

//     // Separator
//     this.add.text(W - 72, barH / 2, '|', {
//       fontSize: '14px', color: 'rgba(255,255,255,0.2)',
//     }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

//     // Red diamond
//     this.add.text(W - 62, barH / 2, '💠', { fontSize: '14px' })
//       .setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);
//     this.redText = this.add.text(W - 44, barH / 2, '0', {
//       fontSize: '14px', fontFamily: 'system-ui, sans-serif',
//       fontStyle: 'bold', color: '#ff4d6d',
//     }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

//     // Pause button
//     this.pauseBtn = this.add.text(W - 10, 10, '⏸', { fontSize: '22px' })
//       .setOrigin(1, 0).setDepth(22).setScrollFactor(0)
//       .setInteractive({ useHandCursor: true })
//       .on('pointerdown', () => this._togglePause());
//   }

//   // ── Registry watcher ─────────────────────────────────────────────────────
//   _onRegistryChange(parent, key, value) {
//     if (key === 'score')  this.scoreText?.setText(`${value} m`);
//     if (key === 'speed')  this.speedText?.setText(`${value} km/h`);
//     if (key === 'coins')  this.coinText?.setText(String(value));
//     if (key === 'blueDiamonds') this.blueText?.setText(String(value));
//     if (key === 'redDiamonds')  this.redText?.setText(String(value));

//     if (key === 'gameOver' && value === true && !this._gameOverShown) {
//       this._gameOverShown = true;
//       this._showGameOver();
//     }
//     if (key === 'gameOver' && value === false) {
//       this._gameOverShown = false;
//       this._destroyOverlay();
//       this.scoreText?.setText('0 m');
//       this.speedText?.setText('0 km/h');
//       this.coinText?.setText('0');
//       this.blueText?.setText('0');
//       this.redText?.setText('0');
//     }
//   }

//   _onHudUpdate({ blueDiamonds, redDiamonds } = {}) {
//     if (blueDiamonds !== undefined) this.blueText?.setText(String(blueDiamonds));
//     if (redDiamonds  !== undefined) this.redText?.setText(String(redDiamonds));
//   }

//   // ── Pause ─────────────────────────────────────────────────────────────────
//   _togglePause() {
//     const key = this._getGameSceneKey();
//     if (!key) return;
//     if (this.scene.isPaused(key)) {
//       this.scene.resume(key);
//       this.pauseBtn.setText('⏸');
//     } else {
//       this.scene.pause(key);
//       this.pauseBtn.setText('▶️');
//     }
//   }

//   // ── Game Over ─────────────────────────────────────────────────────────────
//   _showGameOver() {
//     this._destroyOverlay();

//     const W     = this.scale.width;
//     const H     = this.scale.height;
//     const cardW = Math.min(340, W - 48);
//     const cardH = 360;
//     const cx    = W / 2;
//     const cy    = H / 2;

//     const score = this.registry.get('score')        ?? 0;
//     const coins = this.registry.get('coins')        ?? 0;
//     const blue  = this.registry.get('blueDiamonds') ?? 0;
//     const red   = this.registry.get('redDiamonds')  ?? 0;

//     this._overlayItems = [];

//     const push = (item) => { this._overlayItems.push(item); return item; };

//     push(this.add.rectangle(cx, cy, W, H, 0x000000, 0.78).setDepth(40).setScrollFactor(0));

//     const card = push(this.add.rectangle(cx, cy, cardW, cardH, 0x0d1220, 1).setDepth(41).setScrollFactor(0));
//     card.setStrokeStyle(2, 0xf7931e, 0.6);

//     push(this.add.rectangle(cx, cy - cardH / 2, cardW, 5, 0xf7931e, 1).setDepth(42).setScrollFactor(0));

//     push(this.add.text(cx, cy - 148, 'GAME OVER', {
//       fontSize: '30px', fontFamily: 'system-ui, sans-serif',
//       fontStyle: 'bold', color: '#f7931e',
//       stroke: '#000000', strokeThickness: 2,
//     }).setOrigin(0.5).setDepth(42).setScrollFactor(0));

//     push(this.add.rectangle(cx, cy - 110, cardW - 60, 1, 0xffffff, 0.12).setDepth(42).setScrollFactor(0));

//     // Stats rows
//     const rows = [
//       { label: '🛣  Distance',       value: `${score} m`,  color: '#ffffff' },
//       { label: '🪙  Coins',          value: String(coins), color: '#f7c948' },
//       { label: '💎  Blue Diamonds',  value: String(blue),  color: '#00c3ff' },
//       { label: '💠  Red Diamonds',   value: String(red),   color: '#ff4d6d' },
//     ];

//     rows.forEach(({ label, value, color }, i) => {
//       const rowY = cy - 86 + i * 44;
//       push(this.add.text(cx - (cardW / 2 - 24), rowY, label, {
//         fontSize: '13px', fontFamily: 'system-ui, sans-serif',
//         color: 'rgba(255,255,255,0.55)',
//       }).setOrigin(0, 0.5).setDepth(42).setScrollFactor(0));

//       push(this.add.text(cx + (cardW / 2 - 24), rowY, value, {
//         fontSize: '16px', fontFamily: 'system-ui, sans-serif',
//         fontStyle: 'bold', color,
//       }).setOrigin(1, 0.5).setDepth(42).setScrollFactor(0));
//     });

//     const btnW = cardW - 60;

//     const playBg = push(this.add.rectangle(cx, cy + 110, btnW, 50, 0xf7931e, 1)
//       .setDepth(42).setScrollFactor(0)
//       .setInteractive({ useHandCursor: true })
//       .on('pointerdown', () => this._restart())
//       .on('pointerover',  () => playBg.setFillStyle(0xff9f2e))
//       .on('pointerout',   () => playBg.setFillStyle(0xf7931e)));

//     push(this.add.text(cx, cy + 110, 'PLAY AGAIN', {
//       fontSize: '17px', fontFamily: 'system-ui, sans-serif',
//       fontStyle: 'bold', color: '#ffffff',
//     }).setOrigin(0.5).setDepth(43).setScrollFactor(0));

//     const homeBg = push(this.add.rectangle(cx, cy + 170, btnW, 50, 0x131d35, 1)
//       .setDepth(42).setScrollFactor(0)
//       .setInteractive({ useHandCursor: true })
//       .on('pointerdown', () => this._goHome())
//       .on('pointerover',  () => homeBg.setFillStyle(0x1e2e50))
//       .on('pointerout',   () => homeBg.setFillStyle(0x131d35)));
//     homeBg.setStrokeStyle(1.5, 0xf7931e, 0.7);

//     push(this.add.text(cx, cy + 170, 'HOME', {
//       fontSize: '17px', fontFamily: 'system-ui, sans-serif',
//       fontStyle: 'bold', color: '#f7931e',
//     }).setOrigin(0.5).setDepth(43).setScrollFactor(0));

//     this.scene.bringToTop();
//     this._overlayActive = true;
//   }

//   _destroyOverlay() {
//     if (this._overlayItems) {
//       for (const item of this._overlayItems) item?.destroy();
//       this._overlayItems = null;
//     }
//     this._overlayActive = false;
//   }

//   _restart() {
//     if (!this._overlayActive) return;
//     this._destroyOverlay();
//     this._gameOverShown = false;
//     this.registry.set('gameOver', false);
//     this.registry.get('onRestart')?.();
//   }

//   _goHome() {
//     if (!this._overlayActive) return;
//     this.registry.set('gameOver', false);
//     this._destroyOverlay();
//     this.registry.get('onExit')?.();
//   }
// }

/**
 * UIScene.js — HUD + Game Over overlay
 *
 * Added: PowerUpHUD widget (bottom-left corner)
 * Everything else unchanged.
 */
import Phaser from 'phaser';
import PowerUpHUD from '../ui/PowerUpHUD';             // ← NEW

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.W = W;
    this.H = H;

    this._gameOverShown = false;
    this._overlayActive = false;

    this.input.setTopOnly(true);
    this._createHUD(W);
    this.registry.events.on('changedata', this._onRegistryChange, this);

    // Also listen for diamond updates emitted by IQBoxManager
    this.game.events.on('hud-update', this._onHudUpdate, this);

    // ── NEW: Power-up HUD widget ───────────────────
    this._powerUpHUD = new PowerUpHUD(this);
    this.game.events.on('powerup-update', (data) => {
      this._powerUpHUD?.onPowerUpdate(data);
    });
    // ──────────────────────────────────────────────

    this.scoreText.setText('0 m');
    this.speedText.setText('0 km/h');
    this.coinText.setText('0');
    this.blueText.setText('0');
    this.redText.setText('0');
  }

  _getGameSceneKey() {
    for (const key of ['GameScene', 'OneWayScene']) {
      if (this.scene.isActive(key) || this.scene.isPaused(key)) return key;
    }
    return null;
  }

  // ── HUD ──────────────────────────────────────────────────────────────────
  _createHUD(W) {
    const barH = 52;

    this.add.rectangle(W / 2, barH / 2, W, barH, 0x000000, 0.60)
      .setDepth(20).setScrollFactor(0);

    // Speed — far left
    this.speedText = this.add.text(12, barH / 2, '0 km/h', {
      fontSize: '13px', fontFamily: 'system-ui, sans-serif',
      color: 'rgba(255,255,255,0.65)',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    // Score — centre
    this.scoreText = this.add.text(W / 2, barH / 2, '0 m', {
      fontSize: '20px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    // Right side cluster: 🪙 coins | 💎 blue | 💠 red
    // Gold coin
    this.add.circle(W - 178, barH / 2, 7, 0xf7c948).setDepth(21).setScrollFactor(0);
    this.coinText = this.add.text(W - 167, barH / 2, '0', {
      fontSize: '14px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#f7c948',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    // Separator
    this.add.text(W - 132, barH / 2, '|', {
      fontSize: '14px', color: 'rgba(255,255,255,0.2)',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    // Blue diamond
    this.add.text(W - 122, barH / 2, '💎', { fontSize: '14px' })
      .setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);
    this.blueText = this.add.text(W - 104, barH / 2, '0', {
      fontSize: '14px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#00c3ff',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    // Separator
    this.add.text(W - 72, barH / 2, '|', {
      fontSize: '14px', color: 'rgba(255,255,255,0.2)',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    // Red diamond
    this.add.text(W - 62, barH / 2, '💠', { fontSize: '14px' })
      .setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);
    this.redText = this.add.text(W - 44, barH / 2, '0', {
      fontSize: '14px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ff4d6d',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    // Pause button
    this.pauseBtn = this.add.text(W - 10, 10, '⏸', { fontSize: '22px' })
      .setOrigin(1, 0).setDepth(22).setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this._togglePause());
  }

  // ── Registry watcher ─────────────────────────────────────────────────────
  _onRegistryChange(parent, key, value) {
    if (key === 'score')  this.scoreText?.setText(`${value} m`);
    if (key === 'speed')  this.speedText?.setText(`${value} km/h`);
    if (key === 'coins')  this.coinText?.setText(String(value));
    if (key === 'blueDiamonds') this.blueText?.setText(String(value));
    if (key === 'redDiamonds')  this.redText?.setText(String(value));

    if (key === 'gameOver' && value === true && !this._gameOverShown) {
      this._gameOverShown = true;
      this._showGameOver();
    }
    if (key === 'gameOver' && value === false) {
      this._gameOverShown = false;
      this._destroyOverlay();
      this.scoreText?.setText('0 m');
      this.speedText?.setText('0 km/h');
      this.coinText?.setText('0');
      this.blueText?.setText('0');
      this.redText?.setText('0');
    }
  }

  _onHudUpdate({ blueDiamonds, redDiamonds } = {}) {
    if (blueDiamonds !== undefined) this.blueText?.setText(String(blueDiamonds));
    if (redDiamonds  !== undefined) this.redText?.setText(String(redDiamonds));
  }

  // ── Pause ─────────────────────────────────────────────────────────────────
  _togglePause() {
    const key = this._getGameSceneKey();
    if (!key) return;
    if (this.scene.isPaused(key)) {
      this.scene.resume(key);
      this.pauseBtn.setText('⏸');
    } else {
      this.scene.pause(key);
      this.pauseBtn.setText('▶️');
    }
  }

  // ── Game Over ─────────────────────────────────────────────────────────────
  _showGameOver() {
    this._destroyOverlay();

    const W     = this.scale.width;
    const H     = this.scale.height;
    const cardW = Math.min(340, W - 48);
    const cardH = 360;
    const cx    = W / 2;
    const cy    = H / 2;

    const score = this.registry.get('score')        ?? 0;
    const coins = this.registry.get('coins')        ?? 0;
    const blue  = this.registry.get('blueDiamonds') ?? 0;
    const red   = this.registry.get('redDiamonds')  ?? 0;

    this._overlayItems = [];

    const push = (item) => { this._overlayItems.push(item); return item; };

    push(this.add.rectangle(cx, cy, W, H, 0x000000, 0.78).setDepth(40).setScrollFactor(0));

    const card = push(this.add.rectangle(cx, cy, cardW, cardH, 0x0d1220, 1).setDepth(41).setScrollFactor(0));
    card.setStrokeStyle(2, 0xf7931e, 0.6);

    push(this.add.rectangle(cx, cy - cardH / 2, cardW, 5, 0xf7931e, 1).setDepth(42).setScrollFactor(0));

    push(this.add.text(cx, cy - 148, 'GAME OVER', {
      fontSize: '30px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#f7931e',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(42).setScrollFactor(0));

    push(this.add.rectangle(cx, cy - 110, cardW - 60, 1, 0xffffff, 0.12).setDepth(42).setScrollFactor(0));

    // Stats rows
    const rows = [
      { label: '🛣  Distance',       value: `${score} m`,  color: '#ffffff' },
      { label: '🪙  Coins',          value: String(coins), color: '#f7c948' },
      { label: '💎  Blue Diamonds',  value: String(blue),  color: '#00c3ff' },
      { label: '💠  Red Diamonds',   value: String(red),   color: '#ff4d6d' },
    ];

    rows.forEach(({ label, value, color }, i) => {
      const rowY = cy - 86 + i * 44;
      push(this.add.text(cx - (cardW / 2 - 24), rowY, label, {
        fontSize: '13px', fontFamily: 'system-ui, sans-serif',
        color: 'rgba(255,255,255,0.55)',
      }).setOrigin(0, 0.5).setDepth(42).setScrollFactor(0));

      push(this.add.text(cx + (cardW / 2 - 24), rowY, value, {
        fontSize: '16px', fontFamily: 'system-ui, sans-serif',
        fontStyle: 'bold', color,
      }).setOrigin(1, 0.5).setDepth(42).setScrollFactor(0));
    });

    const btnW = cardW - 60;

    const playBg = push(this.add.rectangle(cx, cy + 110, btnW, 50, 0xf7931e, 1)
      .setDepth(42).setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this._restart())
      .on('pointerover',  () => playBg.setFillStyle(0xff9f2e))
      .on('pointerout',   () => playBg.setFillStyle(0xf7931e)));

    push(this.add.text(cx, cy + 110, 'PLAY AGAIN', {
      fontSize: '17px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(43).setScrollFactor(0));

    const homeBg = push(this.add.rectangle(cx, cy + 170, btnW, 50, 0x131d35, 1)
      .setDepth(42).setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this._goHome())
      .on('pointerover',  () => homeBg.setFillStyle(0x1e2e50))
      .on('pointerout',   () => homeBg.setFillStyle(0x131d35)));
    homeBg.setStrokeStyle(1.5, 0xf7931e, 0.7);

    push(this.add.text(cx, cy + 170, 'HOME', {
      fontSize: '17px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#f7931e',
    }).setOrigin(0.5).setDepth(43).setScrollFactor(0));

    this.scene.bringToTop();
    this._overlayActive = true;
  }

  _destroyOverlay() {
    if (this._overlayItems) {
      for (const item of this._overlayItems) item?.destroy();
      this._overlayItems = null;
    }
    this._overlayActive = false;
  }

  _restart() {
    if (!this._overlayActive) return;
    this._destroyOverlay();
    this._gameOverShown = false;
    this.registry.set('gameOver', false);
    this.registry.get('onRestart')?.();
  }

  _goHome() {
    if (!this._overlayActive) return;
    this.registry.set('gameOver', false);
    this._destroyOverlay();
    this.registry.get('onExit')?.();
  }
}