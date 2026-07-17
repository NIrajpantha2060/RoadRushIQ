

import Phaser from 'phaser';

/**
 * SoundManager.js
 *
 * Sounds
 * ──────
 *  running sound.mp3  → continuous engine loop; rate + volume scale with speed
 *  accelerate.mp3     → plays while accelerating
 *  decelerate.mp3     → plays while decelerating
 *  coin received.mp3  → plays on coin collect
 *  bike crash.mp3     → plays on crash
 */

const KEYS = {
  engine:     'sfx_engine',
  accelerate: 'sfx_accelerate',
  decelerate: 'sfx_decelerate',
  coin:       'sfx_coin',
  crash:      'sfx_crash',
};

const ACCEL_COOLDOWN = 600;
const DECEL_COOLDOWN = 800;

export default class SoundManager {
  constructor(scene) {
    this._scene      = scene;
    this._engine     = null;
    this._accelSound = null;
    this._decelSound = null;
    this._coinSound  = null;
    this._crashSound = null;

    this._accelCooldown = 0;
    this._decelCooldown = 0;
    this._destroyed     = false;

    this._init();
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  _init() {
    const scene = this._scene;

    if (!scene.cache.audio.exists(KEYS.engine)) {
      scene.load.audio(KEYS.engine,     'sounds/running sound.mp3');
      scene.load.audio(KEYS.accelerate, 'sounds/accelerate.mp3');
      scene.load.audio(KEYS.decelerate, 'sounds/decelerate.mp3');
      scene.load.audio(KEYS.coin,       'sounds/coin received.mp3');
      scene.load.audio(KEYS.crash,      'sounds/bike crash.mp3');

      scene.load.once('complete', () => this._createSounds());
      scene.load.start();
    } else {
      this._createSounds();
    }
  }

  _createSounds() {
    if (this._destroyed) return;
    const scene = this._scene;

    this._engine = scene.sound.add(KEYS.engine, {
      loop:   true,
      volume: 0.9,
      rate:   0.85,
    });

    this._accelSound = scene.sound.add(KEYS.accelerate, { volume: 0.85, rate: 1.0 });
    this._decelSound = scene.sound.add(KEYS.decelerate, { volume: 0.80, rate: 1.0 });
    this._coinSound  = scene.sound.add(KEYS.coin,       { volume: 0.2,  rate: 1.0 });
    this._crashSound = scene.sound.add(KEYS.crash,      { volume: 1.0,  rate: 1.0 });

    this._engine.play();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Call every frame from scene update()
   * @param {number}  speed     Current scene speed
   * @param {number}  maxSpeed  MAX_SPEED constant
   * @param {boolean} isAccel   true while UP/W held
   * @param {boolean} isDecel   true while DOWN/S held
   * @param {number}  delta     Frame delta in ms
   */
  update(speed, maxSpeed, isAccel, isDecel, delta = 16) {
    if (this._destroyed) return;

    if (this._engine && !this._engine.isPlaying && !this._engine.isPaused) {
      this._engine.play();
    }

    const t = Phaser.Math.Clamp(speed / maxSpeed, 0, 1);

    if (this._engine) {
      this._engine.setRate(Phaser.Math.Linear(0.75, 1.35, t));
      this._engine.setVolume(Phaser.Math.Linear(0.65, 1.0, t));
    }

    this._accelCooldown = Math.max(0, this._accelCooldown - delta);
    this._decelCooldown = Math.max(0, this._decelCooldown - delta);

    if (isAccel && this._accelCooldown === 0) {
      this._accelSound?.play();
      this._accelCooldown = ACCEL_COOLDOWN;
    }

    if (isDecel && this._decelCooldown === 0) {
      this._decelSound?.play();
      this._decelCooldown = DECEL_COOLDOWN;
    }
  }

  /** Play coin collect sound */
  playCoin() {
    if (this._destroyed) return;
    const rate = 0.95 + Math.random() * 0.15;
    this._coinSound?.play({ rate, volume: 0.2 });
  }

  /** Play crash sound */
  playCrash() {
    if (this._destroyed) return;
    this._crashSound?.play();
  }

  /** Pause engine loop (e.g. game paused) */
  pause() {
    if (this._destroyed) return;
    this._engine?.pause();
  }

  /** Resume engine loop */
  resume() {
    if (this._destroyed) return;
    this._engine?.resume();
  }

  /** Stop all sounds and clean up */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    this._engine?.stop();
    this._accelSound?.stop();
    this._decelSound?.stop();
    this._coinSound?.stop();
    this._crashSound?.stop();

    this._engine     = null;
    this._accelSound = null;
    this._decelSound = null;
    this._coinSound  = null;
    this._crashSound = null;
  }
}