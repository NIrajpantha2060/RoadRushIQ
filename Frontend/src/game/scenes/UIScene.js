
// /**
//  * UIScene.js — HUD + Game Over overlay
//  *
//  * Added: PowerUpHUD widget (bottom-left corner)
//  * Everything else unchanged.
//  */
// import Phaser from 'phaser';
// import PowerUpHUD from '../ui/PowerUpHUD';             // ← NEW

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

//     // ── NEW: Power-up HUD widget ───────────────────
//     this._powerUpHUD = new PowerUpHUD(this);
//     this.game.events.on('powerup-update', (data) => {
//       this._powerUpHUD?.onPowerUpdate(data);
//     });
//     // ──────────────────────────────────────────────

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
 * UIScene.js — HUD + Save Me + Game Over overlay
 *
 * Flow:
 *   crash → 'save-me' event → SaveMe popup (5s countdown)
 *        → Watch Ad  → React shows YouTube iframe → ad done → revive OR game over
 *        → Use Gems  → deduct diamonds → revive
 *        → Timeout   → game over
 *        → Decline   → game over
 */
import Phaser from 'phaser';
import PowerUpHUD from '../ui/PowerUpHUD';

const SAVE_COST_GEMS = 5; // blue diamonds to revive

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.W = W;
    this.H = H;

    this._gameOverShown  = false;
    this._overlayActive  = false;
    this._saveMeShown    = false;
    this._saveMeUsed     = false;   // only one save per run

    this.input.setTopOnly(true);
    this._createHUD(W);
    this.registry.events.on('changedata', this._onRegistryChange, this);

    this.game.events.on('hud-update', this._onHudUpdate, this);

    // Power-up HUD
    this._powerUpHUD = new PowerUpHUD(this);
    this.game.events.on('powerup-update', (data) => {
      this._powerUpHUD?.onPowerUpdate(data);
    });

    // Listen for ad result from React
    this.game.events.on('ad-result', this._onAdResult, this);

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

    this.speedText = this.add.text(12, barH / 2, '0 km/h', {
      fontSize: '13px', fontFamily: 'system-ui, sans-serif',
      color: 'rgba(255,255,255,0.65)',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    this.scoreText = this.add.text(W / 2, barH / 2, '0 m', {
      fontSize: '20px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    this.add.circle(W - 178, barH / 2, 7, 0xf7c948).setDepth(21).setScrollFactor(0);
    this.coinText = this.add.text(W - 167, barH / 2, '0', {
      fontSize: '14px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#f7c948',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    this.add.text(W - 132, barH / 2, '|', {
      fontSize: '14px', color: 'rgba(255,255,255,0.2)',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    this.add.text(W - 122, barH / 2, '💎', { fontSize: '14px' })
      .setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);
    this.blueText = this.add.text(W - 104, barH / 2, '0', {
      fontSize: '14px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#00c3ff',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    this.add.text(W - 72, barH / 2, '|', {
      fontSize: '14px', color: 'rgba(255,255,255,0.2)',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    this.add.text(W - 62, barH / 2, '💠', { fontSize: '14px' })
      .setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);
    this.redText = this.add.text(W - 44, barH / 2, '0', {
      fontSize: '14px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ff4d6d',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

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
      // If save me was NOT shown yet and player hasn't used it → show save me first
      if (!this._saveMeShown && !this._saveMeUsed) {
        this._saveMeShown = true;
        this._showSaveMe();
      } else {
        // Already handled or used — go straight to game over
        this._gameOverShown = true;
        this._showGameOver();
      }
    }

    if (key === 'gameOver' && value === false) {
      this._gameOverShown = false;
      this._saveMeShown   = false;
      this._saveMeUsed    = false;
      this._destroyOverlay();
      this._destroySaveMe();
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

  // ══════════════════════════════════════════════════════════════════════════
  //  SAVE ME POPUP
  // ══════════════════════════════════════════════════════════════════════════

  _showSaveMe() {
    this._destroySaveMe();

    const W     = this.scale.width;
    const H     = this.scale.height;
    const cardW = Math.min(320, W - 48);
    const cx    = W / 2;
    const cy    = H / 2;

    this._saveMeItems = [];
    const push = (item) => { this._saveMeItems.push(item); return item; };

    // Dim background
    push(this.add.rectangle(cx, cy, W, H, 0x000000, 0.82).setDepth(50).setScrollFactor(0));

    // Card
    const card = push(this.add.rectangle(cx, cy, cardW, 320, 0x0d1220, 1)
      .setDepth(51).setScrollFactor(0));
    card.setStrokeStyle(2, 0x00c3ff, 0.7);

    // Top accent bar
    push(this.add.rectangle(cx, cy - 160, cardW, 4, 0x00c3ff, 1).setDepth(52).setScrollFactor(0));

    // Icon — big heart
    push(this.add.text(cx, cy - 118, '💗', { fontSize: '44px' })
      .setOrigin(0.5).setDepth(52).setScrollFactor(0));

    // Title
    push(this.add.text(cx, cy - 64, 'SAVE ME!', {
      fontSize: '26px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(52).setScrollFactor(0));

    // Subtitle
    push(this.add.text(cx, cy - 36, 'Continue your run?', {
      fontSize: '12px', fontFamily: 'system-ui, sans-serif',
      color: 'rgba(255,255,255,0.45)',
    }).setOrigin(0.5).setDepth(52).setScrollFactor(0));

    const btnW = cardW - 40;

    // ── Watch Ad button ────────────────────────────────────────────────────
    const adBg = push(this.add.rectangle(cx, cy + 10, btnW, 52, 0x00c3ff, 1)
      .setDepth(52).setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this._onSaveMeAd())
      .on('pointerover',  () => adBg.setFillStyle(0x33d6ff))
      .on('pointerout',   () => adBg.setFillStyle(0x00c3ff)));

    push(this.add.text(cx - 14, cy + 10, '▶', {
      fontSize: '16px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#07090f',
    }).setOrigin(0.5).setDepth(53).setScrollFactor(0));

    push(this.add.text(cx + 8, cy + 10, 'Watch Ad', {
      fontSize: '15px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#07090f',
    }).setOrigin(0, 0.5).setDepth(53).setScrollFactor(0));

    // ── Use Gems button ────────────────────────────────────────────────────
    const blue = this.registry.get('blueDiamonds') ?? 0;
    const canAfford = blue >= SAVE_COST_GEMS;

    const gemBg = push(this.add.rectangle(cx, cy + 74, btnW, 52, canAfford ? 0x131d35 : 0x0a0e1a, 1)
      .setDepth(52).setScrollFactor(0));
    gemBg.setStrokeStyle(1.5, canAfford ? 0x00c3ff : 0x333355, canAfford ? 0.7 : 0.3);

    if (canAfford) {
      gemBg.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this._onSaveMeGems())
        .on('pointerover',  () => gemBg.setFillStyle(0x1e2e50))
        .on('pointerout',   () => gemBg.setFillStyle(0x131d35));
    }

    push(this.add.text(cx, cy + 74,
      canAfford ? `💎 Use ${SAVE_COST_GEMS} Gems` : `💎 Need ${SAVE_COST_GEMS} Gems (have ${blue})`, {
      fontSize: '14px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold',
      color: canAfford ? '#00c3ff' : 'rgba(255,255,255,0.25)',
    }).setOrigin(0.5).setDepth(53).setScrollFactor(0));

    // ── No thanks ─────────────────────────────────────────────────────────
    const noBtn = push(this.add.text(cx, cy + 128, 'No thanks', {
      fontSize: '12px', fontFamily: 'system-ui, sans-serif',
      color: 'rgba(255,255,255,0.30)',
    }).setOrigin(0.5).setDepth(53).setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this._onSaveMeDecline())
      .on('pointerover',  () => noBtn.setColor('rgba(255,255,255,0.55)'))
      .on('pointerout',   () => noBtn.setColor('rgba(255,255,255,0.30)')));

    // ── 5-second countdown ring ────────────────────────────────────────────
    this._saveMeCountdown = 5;
    this._saveMeTimerText = push(this.add.text(cx, cy - 10, '5', {
      fontSize: '11px', fontFamily: 'system-ui, sans-serif',
      color: 'rgba(255,255,255,0.35)',
    }).setOrigin(0.5).setDepth(53).setScrollFactor(0));

    // Invisible — just used for countdown label positioning near bottom of card
    this._saveMeTimerText.setPosition(cx, cy + 155);

    this._saveMeInterval = setInterval(() => {
      this._saveMeCountdown--;
      if (this._saveMeTimerText) {
        this._saveMeTimerText.setText(`Auto-skip in ${this._saveMeCountdown}s`);
      }
      if (this._saveMeCountdown <= 0) {
        this._onSaveMeDecline();
      }
    }, 1000);

    // Initial label
    this._saveMeTimerText.setText(`Auto-skip in 5s`);

    this.scene.bringToTop();
  }

  _destroySaveMe() {
    clearInterval(this._saveMeInterval);
    this._saveMeInterval = null;
    if (this._saveMeItems) {
      for (const item of this._saveMeItems) item?.destroy();
      this._saveMeItems = null;
    }
  }

  _onSaveMeAd() {
    this._destroySaveMe();
    this._saveMeUsed = true;
    // Tell React to show the YouTube ad
    this.game.events.emit('show-ad', { reason: 'save-me' });
  }

  _onSaveMeGems() {
    const blue = this.registry.get('blueDiamonds') ?? 0;
    if (blue < SAVE_COST_GEMS) return;
    this._destroySaveMe();
    this._saveMeUsed = true;
    this.registry.set('blueDiamonds', blue - SAVE_COST_GEMS);
    this.game.events.emit('hud-update', { blueDiamonds: blue - SAVE_COST_GEMS });
    this._revivePlayer();
  }

  _onSaveMeDecline() {
    this._destroySaveMe();
    this._saveMeUsed    = true;
    this._gameOverShown = true;
    this._showGameOver();
  }

  // Called by React after ad finishes (via 'ad-result' event)
  _onAdResult({ success, reason }) {
    if (reason !== 'save-me') return;
    if (success) {
      this._revivePlayer();
    } else {
      this._gameOverShown = true;
      this._showGameOver();
    }
  }

  // ── Revive the player ─────────────────────────────────────────────────────
  _revivePlayer() {
    const sceneKey = this._getGameSceneKey();
    if (!sceneKey) return;

    const gameScene = this.scene.get(sceneKey);
    if (!gameScene) return;

    // Reset alive flag & clear traffic around player
    gameScene.alive = true;

    // Destroy nearby traffic to give breathing room
    for (const tr of [...(gameScene._traffic ?? [])]) {
      const dist = Math.abs(gameScene.bike.y - tr.container.y);
      if (dist < 300) {
        tr.container.destroy();
        tr.shadow.destroy();
        gameScene._traffic = gameScene._traffic.filter(t => t !== tr);
      }
    }

    // Restore bike visuals
    if (gameScene.bike) {
      gameScene.bike.angle  = 0;
      gameScene.bike.scaleX = 1;
      gameScene.bike.scaleY = 1;
      gameScene.bike.alpha  = 1;
    }

    // Shield for 3 seconds as buffer
    gameScene.shieldActive = true;
    this.time.delayedCall(3000, () => {
      if (gameScene) gameScene.shieldActive = false;
    });

    // Flash cyan to signal revival
    this.cameras.main.flash(400, 0, 195, 255);

    // Countdown then resume
    this._reviveCountdown(gameScene, sceneKey);
  }

  _reviveCountdown(gameScene, sceneKey) {
    let count = 3;
    const cx  = this.W / 2;
    const cy  = this.H / 2;

    const tick = () => {
      if (this._reviveText) { this._reviveText.destroy(); this._reviveText = null; }
      if (count <= 0) {
        if (gameScene.scene.isPaused ? gameScene.scene.isPaused(sceneKey) : false) {
          this.scene.resume(sceneKey);
        }
        return;
      }

      this._reviveText = this.add.text(cx, cy, String(count), {
        fontSize: '96px', fontFamily: 'system-ui, sans-serif',
        fontStyle: 'bold', color: '#00c3ff',
        stroke: '#000000', strokeThickness: 8,
      }).setOrigin(0.5).setDepth(60);

      this.tweens.add({
        targets: this._reviveText,
        scaleX: 2.2, scaleY: 2.2, alpha: 0,
        duration: 900, ease: 'Cubic.easeIn',
      });

      count--;
      setTimeout(tick, 1000);
    };

    tick();
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  GAME OVER OVERLAY
  // ══════════════════════════════════════════════════════════════════════════

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

  _buildRunSummary() {
    return {
      score: this.registry.get('score') ?? 0,
      coins: this.registry.get('coins') ?? 0,
      blueDiamonds: this.registry.get('blueDiamonds') ?? 0,
      redDiamonds: this.registry.get('redDiamonds') ?? 0,
      mode: this.registry.get('trafficMode') ?? 'two-way',
      bikeUsed: this.registry.get('selectedBike') ?? 'skooter',
    };
  }

  _restart() {
    if (!this._overlayActive) return;
    const runSummary = this._buildRunSummary();
    this._destroyOverlay();
    this._gameOverShown = false;
    this.registry.set('gameOver', false);
    this.registry.get('onRestart')?.(runSummary);
  }

  _goHome() {
    if (!this._overlayActive) return;
    const runSummary = this._buildRunSummary();
    this.registry.set('gameOver', false);
    this._destroyOverlay();
    this.registry.get('onExit')?.(runSummary);
  }
}