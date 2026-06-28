/**
 * IQBoxManager.js
 *
 * Changes:
 *  - Reward is now picked by getRandomReward() (60/35/5 rarity) NOT from question
 *  - _applyReward shows float text above bike, same style as coin collect
 *  - 3-2-1 countdown before resume
 */

import Phaser from 'phaser';
import { getRandomQuestion, getRandomReward } from './IQQuestions';

const IQ_SPAWN_INTERVAL_MIN = 18000;
const IQ_SPAWN_INTERVAL_MAX = 32000;
const BOX_SIZE    = 34;
const PULSE_SPEED = 0.04;
const COIN_R      = 16;

export default class IQBoxManager {
  constructor(scene) {
    this.scene       = scene;
    this._boxes      = [];
    this._timer      = this._nextInterval();
    this._elapsed    = 0;
    this._pulseAngle = 0;
    this._active     = true;
  }

  update(delta) {
    if (!this._active) return;
    this._elapsed    += delta;
    this._pulseAngle += PULSE_SPEED;

    if (this._elapsed >= this._timer) {
      this._elapsed = 0;
      this._timer   = this._nextInterval();
      this._spawnBox();
    }

    this._updateBoxes(delta);
  }

  pause()  { this._active = false; }
  resume() { this._active = true;  }

  destroy() {
    for (const box of this._boxes) this._destroyBox(box);
    this._boxes = [];
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _nextInterval() {
    return Phaser.Math.Between(IQ_SPAWN_INTERVAL_MIN, IQ_SPAWN_INTERVAL_MAX);
  }

  _getSpawnLane() {
    const total = this.scene.laneCentres.length;
    if (total === 4) {
      // 60% your side (2,3), 40% opposite side (0,1) — reachable but needs effort
      const pool = Math.random() < 0.60
        ? [2, 3]
        : [0, 1];
      return Phaser.Utils.Array.GetRandom(pool);
    }
    return Phaser.Math.Between(0, total - 1);
  }

  _spawnBox() {
    const scene = this.scene;
    const lane  = this._getSpawnLane();
    const x     = scene.laneCentres[lane];
    const y     = -BOX_SIZE;

    const glow   = scene.add.ellipse(x, y, BOX_SIZE * 2.6, BOX_SIZE * 1.4, 0x00eaff, 0.18).setDepth(8);
    const shadow = scene.add.ellipse(x, y + 10, BOX_SIZE * 1.5, BOX_SIZE * 0.5, 0x000000, 0.3).setDepth(8);

    const gfx = scene.add.graphics().setDepth(9);
    this._drawBox(gfx, 0, 0, 1.0);

    const label = scene.add.text(0, 0, '?', {
      fontSize: '22px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color: '#ffffff',
      stroke: '#003344', strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(10);

    const container = scene.add.container(x, y, [gfx, label]).setDepth(9);
    this._boxes.push({ container, glow, shadow, lane, gfx, label });
  }

  _drawBox(gfx, ox, oy, glowAlpha) {
    gfx.clear();
    const s = BOX_SIZE, h = s / 2;

    gfx.fillStyle(0x00eaff, 0.22 * glowAlpha);
    gfx.fillRoundedRect(ox - h - 4, oy - h - 4, s + 8, s + 8, 10);

    gfx.fillStyle(0x003344, 1);
    gfx.fillRoundedRect(ox - h, oy - h, s, s, 7);

    gfx.fillStyle(0x00eaff, 0.55 * glowAlpha);
    gfx.fillRoundedRect(ox - h + 2, oy - h + 2, s - 4, 5, 3);

    gfx.fillStyle(0x00eaff, 0.7 * glowAlpha);
    const cr = 3;
    gfx.fillCircle(ox - h + cr + 2, oy - h + cr + 2, cr);
    gfx.fillCircle(ox + h - cr - 2, oy - h + cr + 2, cr);
    gfx.fillCircle(ox - h + cr + 2, oy + h - cr - 2, cr);
    gfx.fillCircle(ox + h - cr - 2, oy + h - cr - 2, cr);

    gfx.lineStyle(2, 0x00eaff, 0.85 * glowAlpha);
    gfx.strokeRoundedRect(ox - h, oy - h, s, s, 7);
  }

  _updateBoxes(delta) {
    const scene = this.scene;
    const speed = scene.speed;
    const dt    = delta / 1000;
    const bx    = scene.bike.x;
    const by    = scene.bike.y;
    const pulse = (Math.sin(this._pulseAngle) + 1) / 2;

    for (const box of this._boxes) {
      box.container.y += speed * dt;
      box.glow.y      += speed * dt;
      box.shadow.y    += speed * dt;
      box.glow.x       = box.container.x;
      box.shadow.x     = box.container.x;

      this._drawBox(box.gfx, 0, 0, 0.5 + pulse * 0.5);
      box.glow.setAlpha(0.12 + pulse * 0.18);
      box.container.y += Math.sin(this._pulseAngle * 2) * 0.4;

      const dx = Math.abs(bx - box.container.x);
      const dy = Math.abs(by - box.container.y);
      if (dx < COIN_R + 4 && dy < COIN_R + 4 + 14) {
        this._collectBox(box);
        return;
      }
    }

    this._boxes = this._boxes.filter(box => {
      if (box.container.y > scene.H + 80) {
        this._destroyBox(box);
        return false;
      }
      return true;
    });
  }

  _collectBox(box) {
    const scene = this.scene;
    this._boxes = this._boxes.filter(b => b !== box);
    this._burstEffect(box.container.x, box.container.y);
    this._destroyBox(box);

    scene.scene.pause(scene.scene.key);
    this.pause();

    const question = getRandomQuestion(scene.score ?? 0);

    // ── Roll the reward NOW (rarity: 60% gold / 35% blue / 5% red)
    // Store it so both the popup preview AND _handleAnswer use the same roll.
    this._pendingReward = getRandomReward();

    // Attach reward to question so IQPopup can show the preview
    question.reward = this._pendingReward;

    scene.game.events.emit('iq-collected', {
      question,
      onAnswer: (correct) => this._handleAnswer(correct),
      onSkip:   ()        => this._handleSkip(),
    });
  }

  _handleAnswer(correct) {
    if (correct && this._pendingReward) {
      this._applyReward(this._pendingReward);
    }
    this._pendingReward = null;
    this._countdownResume();
  }

  _handleSkip() {
    this._pendingReward = null;
    this._countdownResume();
  }

  // ── 3-2-1 countdown then resume ──────────────────────────────────────────

  _countdownResume() {
    const scene = this.scene;
    const cx    = scene.W / 2;
    const cy    = scene.H / 2;
    let   count = 3;

    const tick = () => {
      if (this._countdownText) {
        this._countdownText.destroy();
        this._countdownText = null;
      }
      if (count <= 0) {
        scene.scene.resume(scene.scene.key);
        this.resume();
        return;
      }

      this._countdownText = scene.add.text(cx, cy, String(count), {
        fontSize:        '96px',
        fontFamily:      'system-ui, sans-serif',
        fontStyle:       'bold',
        color:           '#ffffff',
        stroke:          '#000000',
        strokeThickness: 8,
      }).setOrigin(0.5).setDepth(60);

      scene.tweens.add({
        targets:  this._countdownText,
        scaleX:   2.2, scaleY: 2.2,
        alpha:    0,
        duration: 900,
        ease:     'Cubic.easeIn',
      });

      count--;
      setTimeout(tick, 1000);
    };

    tick();
  }

  // ── Apply reward + floating label above the bike ──────────────────────────

  _applyReward(reward) {
    const scene = this.scene;

    if (reward.type === 'gold') {
      scene.coins = (scene.coins ?? 0) + reward.amount;
      scene.registry.set('coins', scene.coins);
      this._floatAtBike(`+${reward.amount} 🪙`, '#f7c948');
    }

    if (reward.type === 'blue') {
      const prev = scene.registry.get('blueDiamonds') ?? 0;
      scene.registry.set('blueDiamonds', prev + reward.amount);
      // Also show in HUD counter
      scene.game.events.emit('hud-update', { blueDiamonds: prev + reward.amount });
      this._floatAtBike(`+${reward.amount} 💎`, '#00c3ff');
    }

    if (reward.type === 'red') {
      const prev = scene.registry.get('redDiamonds') ?? 0;
      scene.registry.set('redDiamonds', prev + reward.amount);
      scene.game.events.emit('hud-update', { redDiamonds: prev + reward.amount });
      this._floatAtBike(`+${reward.amount} 💠`, '#ff4d6d');
    }
  }

  /**
   * Floating +label that rises from the bike position —
   * exactly the same style as coin collection popups.
   */
  _floatAtBike(text, color) {
    const scene = this.scene;
    const x     = scene.bike.x;
    const y     = scene.bike.y - 40; // start just above the bike

    const txt = scene.add.text(x, y, text, {
      fontSize:        '22px',
      fontFamily:      'system-ui, sans-serif',
      fontStyle:       'bold',
      color,
      stroke:          '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(50);

    scene.tweens.add({
      targets:  txt,
      y:        y - 80,
      alpha:    0,
      scaleX:   1.4,
      scaleY:   1.4,
      duration: 1000,
      ease:     'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });

    // Particle burst (same as coin collect)
    for (let i = 0; i < 5; i++) {
      const angle  = (i / 5) * Math.PI * 2;
      const pColor = reward => reward === '#f7c948' ? 0xf7c948
                             : reward === '#00c3ff' ? 0x00c3ff
                             : 0xff4d6d;
      const dot = scene.add.circle(x, y, 4, pColor(color)).setDepth(49);
      scene.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * 26,
        y: y + Math.sin(angle) * 26,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: 420, ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  _burstEffect(x, y) {
    const scene = this.scene;
    const ring  = scene.add.ellipse(x, y, 10, 10, 0x00eaff, 0.8).setDepth(15);
    scene.tweens.add({
      targets: ring, scaleX: 5, scaleY: 5, alpha: 0,
      duration: 400, ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dot   = scene.add.circle(x, y, 5, 0x00eaff).setDepth(14);
      scene.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: 450, ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  _destroyBox(box) {
    box.container.destroy();
    box.glow.destroy();
    box.shadow.destroy();
  }
}