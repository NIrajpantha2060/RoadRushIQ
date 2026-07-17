// /**
//  * PowerUpManager.js
//  *
//  * Reusable manager that handles the lifecycle of any power-up:
//  *   idle → active (duration countdown) → cooldown → idle
//  *
//  * The scene calls:
//  *   manager.tryActivate()   — on SPACE press
//  *   manager.update(delta)   — every frame
//  *   manager.destroy()       — on crash / scene shutdown
//  *
//  * Adding a new power: add its class to POWER_REGISTRY below.
//  * No changes needed anywhere else.
//  */

// import ShieldPower from './ShieldPower';
// import MagnetPower from './MagnetPower';

// // ── Registry: type string → Power class ───────────────────────────────────
// // Add new powers here only.
// const POWER_REGISTRY = {
//   shield: ShieldPower,
//   magnet: MagnetPower,
//   // nitro:        NitroPower,
//   // doubleCoins:  DoubleCoinsPower,
//   // freezeTraffic: FreezeTrafficPower,
// };

// // ── States ─────────────────────────────────────────────────────────────────
// const STATE_IDLE     = 'idle';
// const STATE_ACTIVE   = 'active';
// const STATE_COOLDOWN = 'cooldown';

// export default class PowerUpManager {
//   /**
//    * @param {Phaser.Scene} scene       – the game scene (GameScene or OneWayScene)
//    * @param {object|null}  powerConfig – the `power` block from BikeConfig, or null
//    */
//   constructor(scene, powerConfig) {
//     this.scene        = scene;
//     this.powerConfig  = powerConfig;
//     this.hasPower     = !!powerConfig;

//     this._state       = STATE_IDLE;
//     this._elapsed     = 0;   // ms into current state
//     this._powerInst   = null; // instantiated power class

//     if (this.hasPower) {
//       const PowerClass = POWER_REGISTRY[powerConfig.type];
//       if (!PowerClass) {
//         console.warn(`[PowerUpManager] Unknown power type: "${powerConfig.type}"`);
//         this.hasPower = false;
//         return;
//       }
//       this._powerInst = new PowerClass(scene, powerConfig.options ?? {});
//     }
//   }

//   // ── Public API ────────────────────────────────────────────────────────────

//   /** Called on SPACE keydown from the scene's _handleInput */
//   tryActivate() {
//     if (!this.hasPower)               return;
//     if (this._state !== STATE_IDLE)   return;  // on cooldown or already active

//     this._state   = STATE_ACTIVE;
//     this._elapsed = 0;
//     this._powerInst.activate();

//     // Notify HUD
//     this._emitHudState();
//   }

//   /** Called every frame from the scene's update() */
//   update(delta) {
//     if (!this.hasPower) return;
//     if (this._state === STATE_IDLE) return;

//     this._elapsed += delta;

//     if (this._state === STATE_ACTIVE) {
//       this._powerInst.update(delta);

//       if (this._elapsed >= this.powerConfig.duration) {
//         // Duration expired → start cooldown
//         this._powerInst.deactivate();
//         this._state   = STATE_COOLDOWN;
//         this._elapsed = 0;
//         this._emitHudState();
//       } else {
//         this._emitHudState();
//       }
//     }

//     else if (this._state === STATE_COOLDOWN) {
//       if (this._elapsed >= this.powerConfig.cooldown) {
//         // Cooldown done → back to idle
//         this._state   = STATE_IDLE;
//         this._elapsed = 0;
//         this._emitHudState();
//       } else {
//         this._emitHudState();
//       }
//     }
//   }

//   /** Called on crash or scene shutdown */
//   destroy() {
//     if (this._powerInst) this._powerInst.destroy();
//     this._state = STATE_IDLE;
//   }

//   // ── Getters used by PowerUpHUD ────────────────────────────────────────────

//   get state()            { return this._state; }
//   get isActive()         { return this._state === STATE_ACTIVE; }
//   get isCooldown()       { return this._state === STATE_COOLDOWN; }
//   get isIdle()           { return this._state === STATE_IDLE; }

//   /** 0→1 progress of active duration (1 = just activated, 0 = about to expire) */
//   get activeProgress() {
//     if (!this.hasPower || this._state !== STATE_ACTIVE) return 0;
//     return 1 - this._elapsed / this.powerConfig.duration;
//   }

//   /** 0→1 progress of cooldown (0 = just started, 1 = ready) */
//   get cooldownProgress() {
//     if (!this.hasPower || this._state !== STATE_COOLDOWN) return 0;
//     return this._elapsed / this.powerConfig.cooldown;
//   }

//   /** Remaining active time in seconds (for display) */
//   get activeSecondsLeft() {
//     if (!this.hasPower || this._state !== STATE_ACTIVE) return 0;
//     return Math.ceil((this.powerConfig.duration - this._elapsed) / 1000);
//   }

//   /** Remaining cooldown in seconds (for display) */
//   get cooldownSecondsLeft() {
//     if (!this.hasPower || this._state !== STATE_COOLDOWN) return 0;
//     return Math.ceil((this.powerConfig.cooldown - this._elapsed) / 1000);
//   }

//   // ── Internal ──────────────────────────────────────────────────────────────

//   /** Emit HUD state via game.events so UIScene / PowerUpHUD can react */
//   _emitHudState() {
//     if (!this.hasPower) return;
//     this.scene.game.events.emit('powerup-update', {
//       label:            this.powerConfig.label,
//       color:            this.powerConfig.color,
//       state:            this._state,
//       activeProgress:   this.activeProgress,
//       cooldownProgress: this.cooldownProgress,
//       activeSecondsLeft:   this.activeSecondsLeft,
//       cooldownSecondsLeft: this.cooldownSecondsLeft,
//     });
//   }
// }

/**
 * PowerUpManager.js
 *
 * Reusable manager that handles the lifecycle of any power-up:
 *   idle → active (duration countdown) → cooldown → idle
 *
 * The scene calls:
 *   manager.tryActivate()   — on SPACE press
 *   manager.update(delta)   — every frame
 *   manager.destroy()       — on crash / scene shutdown
 *
 * Adding a new power: add its class to POWER_REGISTRY below.
 * No changes needed anywhere else.
 */

import ShieldPower from './ShieldPower';
import MagnetPower from './MagnetPower';

// ── Registry: type string → Power class ───────────────────────────────────
// Add new powers here only.
const POWER_REGISTRY = {
  shield: ShieldPower,
  magnet: MagnetPower,
  // nitro:        NitroPower,
  // doubleCoins:  DoubleCoinsPower,
  // freezeTraffic: FreezeTrafficPower,
};

// ── States ─────────────────────────────────────────────────────────────────
const STATE_IDLE     = 'idle';
const STATE_ACTIVE   = 'active';
const STATE_COOLDOWN = 'cooldown';

export default class PowerUpManager {
  /**
   * @param {Phaser.Scene} scene       – the game scene (GameScene or OneWayScene)
   * @param {object|null}  powerConfig – the `power` block from BikeConfig, or null
   */
  constructor(scene, powerConfig) {
    this.scene        = scene;
    this.powerConfig  = powerConfig;
    this.hasPower     = !!powerConfig;

    this._state       = STATE_IDLE;
    this._elapsed     = 0;   // ms into current state
    this._powerInst   = null; // instantiated power class

    if (this.hasPower) {
      const PowerClass = POWER_REGISTRY[powerConfig.type];
      if (!PowerClass) {
        console.warn(`[PowerUpManager] Unknown power type: "${powerConfig.type}"`);
        this.hasPower = false;
        return;
      }
      this._powerInst = new PowerClass(scene, powerConfig.options ?? {});
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Called on SPACE keydown from the scene's _handleInput */
  tryActivate() {
    if (!this.hasPower)               return;
    if (this._state !== STATE_IDLE)   return;  // on cooldown or already active

    this._state   = STATE_ACTIVE;
    this._elapsed = 0;
    this._powerInst.activate();

    // Notify HUD
    this._emitHudState();
  }

  /** Called every frame from the scene's update() */
  update(delta) {
    if (!this.hasPower) return;
    if (this._state === STATE_IDLE) return;

    this._elapsed += delta;

    if (this._state === STATE_ACTIVE) {
      this._powerInst.update(delta);

      if (this._elapsed >= this.powerConfig.duration) {
        // Duration expired → start cooldown
        this._powerInst.deactivate();
        this._state   = STATE_COOLDOWN;
        this._elapsed = 0;
        this._emitHudState();
      } else {
        this._emitHudState();
      }
    }

    else if (this._state === STATE_COOLDOWN) {
      if (this._elapsed >= this.powerConfig.cooldown) {
        // Cooldown done → back to idle
        this._state   = STATE_IDLE;
        this._elapsed = 0;
        this._emitHudState();
      } else {
        this._emitHudState();
      }
    }
  }

  /** Called on crash or scene shutdown */
  destroy() {
    if (this._powerInst) this._powerInst.destroy();
    this._powerInst = null;
    this._state = STATE_IDLE;
  }

  /** Called on revive — clears any active/cooldown timer without destroying the power instance */
  reset() {
    if (!this.hasPower) return;
    if (this._state === STATE_ACTIVE) {
      this._powerInst.deactivate();
    }
    this._state   = STATE_IDLE;
    this._elapsed = 0;
    this._emitHudState();
  }

  // ── Getters used by PowerUpHUD ────────────────────────────────────────────

  get state()            { return this._state; }
  get isActive()         { return this._state === STATE_ACTIVE; }
  get isCooldown()       { return this._state === STATE_COOLDOWN; }
  get isIdle()           { return this._state === STATE_IDLE; }

  /** 0→1 progress of active duration (1 = just activated, 0 = about to expire) */
  get activeProgress() {
    if (!this.hasPower || this._state !== STATE_ACTIVE) return 0;
    return 1 - this._elapsed / this.powerConfig.duration;
  }

  /** 0→1 progress of cooldown (0 = just started, 1 = ready) */
  get cooldownProgress() {
    if (!this.hasPower || this._state !== STATE_COOLDOWN) return 0;
    return this._elapsed / this.powerConfig.cooldown;
  }

  /** Remaining active time in seconds (for display) */
  get activeSecondsLeft() {
    if (!this.hasPower || this._state !== STATE_ACTIVE) return 0;
    return Math.ceil((this.powerConfig.duration - this._elapsed) / 1000);
  }

  /** Remaining cooldown in seconds (for display) */
  get cooldownSecondsLeft() {
    if (!this.hasPower || this._state !== STATE_COOLDOWN) return 0;
    return Math.ceil((this.powerConfig.cooldown - this._elapsed) / 1000);
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  /** Emit HUD state via game.events so UIScene / PowerUpHUD can react */
  _emitHudState() {
    if (!this.hasPower) return;
    this.scene.game.events.emit('powerup-update', {
      label:            this.powerConfig.label,
      color:            this.powerConfig.color,
      state:            this._state,
      activeProgress:   this.activeProgress,
      cooldownProgress: this.cooldownProgress,
      activeSecondsLeft:   this.activeSecondsLeft,
      cooldownSecondsLeft: this.cooldownSecondsLeft,
    });
  }
}