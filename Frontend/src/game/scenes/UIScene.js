// /**
//  * UIScene.js — fixed Play Again button
//  */
// import Phaser from 'phaser';

// export default class UIScene extends Phaser.Scene {
// 	constructor() {
// 		super({ key: 'UIScene' });
// 	}

// 	create() {
// 		const W = this.scale.width;
// 		this._gameOverShown = false;
// 		this.input.setTopOnly(true);
// 		this._createHUD(W);
// 		this.registry.events.on('changedata', this._onRegistryChange, this);
// 		this.scoreText.setText('0 m');
// 		this.speedText.setText('0 km/h');
// 		this.coinText.setText('0');
// 	}

// 	// ── HUD ─────────────────────────────────────
// 	_createHUD(W) {
// 		const barH = 52;

// 		this.add.rectangle(W / 2, barH / 2, W, barH, 0x000000, 0.50)
// 			.setDepth(20).setScrollFactor(0);

// 		// Score centre
// 		this.scoreText = this.add.text(W / 2, barH / 2, '0 m', {
// 			fontSize: '20px', fontFamily: 'system-ui, sans-serif',
// 			fontStyle: 'bold', color: '#ffffff',
// 		}).setOrigin(0.5).setDepth(21).setScrollFactor(0);

// 		// Speed left
// 		this.speedText = this.add.text(16, barH / 2, '0 km/h', {
// 			fontSize: '13px', fontFamily: 'system-ui, sans-serif',
// 			color: 'rgba(255,255,255,0.6)',
// 		}).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

// 		// Coin right
// 		this.add.circle(W - 52, barH / 2, 9, 0xf7c948)
// 			.setDepth(21).setScrollFactor(0);

// 		this.coinText = this.add.text(W - 38, barH / 2, '0', {
// 			fontSize: '15px', fontFamily: 'system-ui, sans-serif',
// 			fontStyle: 'bold', color: '#f7c948',
// 		}).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

// 		// Pause
// 		this.pauseBtn = this.add.text(W - 16, 6, '⏸', { fontSize: '22px' })
// 			.setOrigin(1, 0).setDepth(21).setScrollFactor(0)
// 			.setInteractive({ useHandCursor: true })
// 			.on('pointerdown', () => this._togglePause());

// 		// Game over overlay
// 		this._createGameOverOverlay(W);
// 	}

// 	// ── Game Over overlay ────────────────────────
// 	_createGameOverOverlay(W) {
// 		const H     = this.scale.height;
// 		const cardW = Math.min(320, W - 48);

// 		this.goGroup = this.add.group();

// 		const backdrop = this.add
// 			.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
// 			.setDepth(30).setScrollFactor(0);

// 		const card = this.add
// 			.rectangle(W / 2, H / 2, cardW, 300, 0x0d1220, 1)
// 			.setDepth(31).setScrollFactor(0)
// 			.setStrokeStyle(1, 0x2a3550);

// 		const title = this.add.text(W / 2, H / 2 - 110, 'GAME OVER', {
// 			fontSize: '28px', fontFamily: 'system-ui, sans-serif',
// 			fontStyle: 'bold', color: '#f7931e',
// 		}).setOrigin(0.5).setDepth(32).setScrollFactor(0);

// 		this.goScoreLabel = this.add.text(W / 2, H / 2 - 58, 'Distance: 0 m', {
// 			fontSize: '16px', fontFamily: 'system-ui, sans-serif',
// 			color: 'rgba(255,255,255,0.85)',
// 		}).setOrigin(0.5).setDepth(32).setScrollFactor(0);

// 		this.goCoinLabel = this.add.text(W / 2, H / 2 - 28, 'Coins: 0', {
// 			fontSize: '15px', fontFamily: 'system-ui, sans-serif',
// 			color: '#f7c948',
// 		}).setOrigin(0.5).setDepth(32).setScrollFactor(0);

// 		// ── Play Again button ──
// 		const btnW  = 180;
// 		const restBg = this.add
// 			.rectangle(W / 2, H / 2 + 50, btnW, 48, 0xf7931e)
// 			.setDepth(32).setScrollFactor(0)
// 			.setInteractive({ useHandCursor: true })
// 			.on('pointerup', () => this._restart())
// 			.on('pointerover',  () => restBg.setFillStyle(0xe6700d))
// 			.on('pointerout',   () => restBg.setFillStyle(0xf7931e));

// 		this.add.text(W / 2, H / 2 + 50, 'PLAY AGAIN', {
// 			fontSize: '16px', fontFamily: 'system-ui, sans-serif',
// 			fontStyle: 'bold', color: '#ffffff',
// 		}).setOrigin(0.5).setDepth(33).setScrollFactor(0);

// 		// ── Home button ──
// 		const homeBg = this.add
// 			.rectangle(W / 2, H / 2 + 112, btnW, 48, 0x1a2540)
// 			.setDepth(32).setScrollFactor(0)
// 			.setInteractive({ useHandCursor: true })
// 			.on('pointerup', () => this._goHome())
// 			.on('pointerover',  () => homeBg.setFillStyle(0x243050))
// 			.on('pointerout',   () => homeBg.setFillStyle(0x1a2540))
// 			.setStrokeStyle(1, 0xf7931e);

// 		this.add.text(W / 2, H / 2 + 112, 'HOME', {
// 			fontSize: '16px', fontFamily: 'system-ui, sans-serif',
// 			fontStyle: 'bold', color: '#f7931e',
// 		}).setOrigin(0.5).setDepth(33).setScrollFactor(0);

// 		this.goGroup.addMultiple([backdrop, card, title, this.goScoreLabel, this.goCoinLabel, restBg, homeBg]);
// 		this.goGroup.setVisible(false);
// 	}

// 	// ── Registry watcher ────────────────────────
// 	_onRegistryChange(parent, key, value) {
// 		if (key === 'score')   this.scoreText.setText(`${value} m`);
// 		if (key === 'speed')   this.speedText.setText(`${value} km/h`);
// 		if (key === 'coins')   this.coinText.setText(String(value));
// 		if (key === 'gameOver' && value === true && !this._gameOverShown) {
// 			this._gameOverShown = true;
// 			this._showGameOver();
// 		}
// 		// Reset flag when game restarts
// 		if (key === 'gameOver' && value === false) {
// 			this._gameOverShown = false;
// 			this.goGroup.setVisible(false);
// 			this.scoreText.setText('0 m');
// 			this.speedText.setText('0 km/h');
// 			this.coinText.setText('0');
// 		}
// 	}

// 	// ── Pause ────────────────────────────────────
// 	_togglePause() {
// 		const gs = this.scene.get('GameScene');
// 		if (!gs) return;
// 		if (this.scene.isPaused('GameScene')) {
// 			this.scene.resume('GameScene');
// 			this.pauseBtn.setText('⏸');
// 		} else {
// 			this.scene.pause('GameScene');
// 			this.pauseBtn.setText('▶️');
// 		}
// 	}

// 	// ── Game Over ────────────────────────────────
// 	_showGameOver() {
// 		const score = this.registry.get('score') ?? 0;
// 		const coins = this.registry.get('coins') ?? 0;
// 		this.goScoreLabel.setText(`Distance: ${score} m`);
// 		this.goCoinLabel.setText(`Coins: ${coins}`);
// 		this.goGroup.setVisible(true);
// 		this.scene.bringToTop();

// 		// Make sure all GO group children are also interactive-visible
// 		this.goGroup.getChildren().forEach(child => {
// 			if (child.input) child.setInteractive();
// 		});
// 	}

// 	// ── Actions ──────────────────────────────────
// 	_restart() {
// 		this.registry.set('gameOver', false);
// 		this.goGroup.setVisible(false);
// 		this._gameOverShown = false;

// 		const onRestart = this.registry.get('onRestart');
// 		if (typeof onRestart === 'function') {
// 			onRestart();
// 			return;
// 		}

// 		this.scene.stop('GameScene');
// 		this.scene.start('GameScene');
// 	}

// 	_goHome() {
// 		const onExit = this.registry.get('onExit');
// 		this.registry.set('gameOver', false);
// 		this.scene.stop('GameScene');
// 		this.scene.stop('UIScene');
// 		onExit?.();
// 	}
// }


/**
 * UIScene.js — HUD + Game Over overlay
 *
 * Fixes:
 *  - Game Over card now always renders fully (backdrop + card bg + all elements)
 *  - Overlay is built fresh each time it needs to show, avoiding stale state
 *  - Pause button works correctly
 */
import Phaser from 'phaser';

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

    // Registry listener
    this.registry.events.on('changedata', this._onRegistryChange, this);

    // Reset display
    this.scoreText.setText('0 m');
    this.speedText.setText('0 km/h');
    this.coinText.setText('0');
  }

  // ── HUD ─────────────────────────────────────
  _createHUD(W) {
    const barH = 52;

    // HUD bar background
    this.add.rectangle(W / 2, barH / 2, W, barH, 0x000000, 0.55)
      .setDepth(20).setScrollFactor(0);

    // Score — centre
    this.scoreText = this.add.text(W / 2, barH / 2, '0 m', {
      fontSize: '20px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    // Speed — left
    this.speedText = this.add.text(16, barH / 2, '0 km/h', {
      fontSize: '13px', fontFamily: 'system-ui, sans-serif',
      color: 'rgba(255,255,255,0.65)',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    // Coin icon + count — right
    this.add.circle(W - 52, barH / 2, 9, 0xf7c948)
      .setDepth(21).setScrollFactor(0);

    this.coinText = this.add.text(W - 38, barH / 2, '0', {
      fontSize: '15px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#f7c948',
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    // Pause button
    this.pauseBtn = this.add.text(W - 16, 10, '⏸', { fontSize: '22px' })
      .setOrigin(1, 0).setDepth(21).setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this._togglePause());
  }

  // ── Registry watcher ────────────────────────
  _onRegistryChange(parent, key, value) {
    if (key === 'score') {
      this.scoreText?.setText(`${value} m`);
    }
    if (key === 'speed') {
      this.speedText?.setText(`${value} km/h`);
    }
    if (key === 'coins') {
      this.coinText?.setText(String(value));
    }
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
    }
  }

  // ── Pause ────────────────────────────────────
  _togglePause() {
    const gs = this.scene.get('GameScene');
    if (!gs) return;
    if (this.scene.isPaused('GameScene')) {
      this.scene.resume('GameScene');
      this.pauseBtn.setText('⏸');
    } else {
      this.scene.pause('GameScene');
      this.pauseBtn.setText('▶️');
    }
  }

  // ── Game Over ────────────────────────────────
  _showGameOver() {
    // Destroy any leftover overlay first
    this._destroyOverlay();

    const W     = this.scale.width;
    const H     = this.scale.height;
    const cardW = Math.min(340, W - 48);
    const cardH = 320;
    const cx    = W / 2;
    const cy    = H / 2;

    const score = this.registry.get('score') ?? 0;
    const coins = this.registry.get('coins') ?? 0;

    this._overlayItems = [];

    // ── Dark full-screen backdrop ──
    const backdrop = this.add.rectangle(cx, cy, W, H, 0x000000, 0.78)
      .setDepth(40).setScrollFactor(0);
    this._overlayItems.push(backdrop);

    // ── Card background ──
    const card = this.add.rectangle(cx, cy, cardW, cardH, 0x0d1220, 1)
      .setDepth(41).setScrollFactor(0);
    card.setStrokeStyle(2, 0xf7931e, 0.6);
    this._overlayItems.push(card);

    // ── Decorative top accent bar ──
    const accentBar = this.add.rectangle(cx, cy - cardH / 2, cardW, 5, 0xf7931e, 1)
      .setDepth(42).setScrollFactor(0);
    this._overlayItems.push(accentBar);

    // ── GAME OVER title ──
    const title = this.add.text(cx, cy - 120, 'GAME OVER', {
      fontSize: '30px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#f7931e',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(42).setScrollFactor(0);
    this._overlayItems.push(title);

    // ── Divider line ──
    const divider = this.add.rectangle(cx, cy - 84, cardW - 60, 1, 0xffffff, 0.12)
      .setDepth(42).setScrollFactor(0);
    this._overlayItems.push(divider);

    // ── Stats ──
    const distLabel = this.add.text(cx, cy - 64, '🛣  Distance', {
      fontSize: '13px', fontFamily: 'system-ui, sans-serif',
      color: 'rgba(255,255,255,0.5)',
    }).setOrigin(0.5).setDepth(42).setScrollFactor(0);
    this._overlayItems.push(distLabel);

    const distValue = this.add.text(cx, cy - 44, `${score} m`, {
      fontSize: '22px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(42).setScrollFactor(0);
    this._overlayItems.push(distValue);

    const coinLabel = this.add.text(cx, cy - 14, '🪙  Coins collected', {
      fontSize: '13px', fontFamily: 'system-ui, sans-serif',
      color: 'rgba(255,255,255,0.5)',
    }).setOrigin(0.5).setDepth(42).setScrollFactor(0);
    this._overlayItems.push(coinLabel);

    const coinValue = this.add.text(cx, cy + 6, `${coins}`, {
      fontSize: '22px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#f7c948',
    }).setOrigin(0.5).setDepth(42).setScrollFactor(0);
    this._overlayItems.push(coinValue);

    // ── PLAY AGAIN button ──
    const btnW = cardW - 60;
    const playBg = this.add.rectangle(cx, cy + 70, btnW, 50, 0xf7931e, 1)
      .setDepth(42).setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown',  () => this._restart())
      .on('pointerover',  () => playBg.setFillStyle(0xff9f2e))
      .on('pointerout',   () => playBg.setFillStyle(0xf7931e));
    this._overlayItems.push(playBg);

    const playText = this.add.text(cx, cy + 70, 'PLAY AGAIN', {
      fontSize: '17px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(43).setScrollFactor(0);
    this._overlayItems.push(playText);

    // ── HOME button ──
    const homeBg = this.add.rectangle(cx, cy + 134, btnW, 50, 0x131d35, 1)
      .setDepth(42).setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown',  () => this._goHome())
      .on('pointerover',  () => homeBg.setFillStyle(0x1e2e50))
      .on('pointerout',   () => homeBg.setFillStyle(0x131d35));
    homeBg.setStrokeStyle(1.5, 0xf7931e, 0.7);
    this._overlayItems.push(homeBg);

    const homeText = this.add.text(cx, cy + 134, 'HOME', {
      fontSize: '17px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#f7931e',
    }).setOrigin(0.5).setDepth(43).setScrollFactor(0);
    this._overlayItems.push(homeText);

    // Bring this scene on top so buttons are interactive
    this.scene.bringToTop();
    this._overlayActive = true;
  }

  _destroyOverlay() {
    if (this._overlayItems) {
      for (const item of this._overlayItems) {
        if (item && item.destroy) item.destroy();
      }
      this._overlayItems = null;
    }
    this._overlayActive = false;
  }

  // ── Actions ──────────────────────────────────
  _restart() {
    if (!this._overlayActive) return;
    this._destroyOverlay();
    this._gameOverShown = false;
    this.registry.set('gameOver', false);

    const onRestart = this.registry.get('onRestart');
    if (typeof onRestart === 'function') {
      onRestart();
      return;
    }

    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }

  _goHome() {
    if (!this._overlayActive) return;
    const onExit = this.registry.get('onExit');
    this.registry.set('gameOver', false);
    this._destroyOverlay();
    if (typeof onExit === 'function') {
      onExit();
      return;
    }

    this.scene.stop('GameScene');
    this.scene.stop('UIScene');
  }
}