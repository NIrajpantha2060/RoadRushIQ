/**
 * BikeConfig.js
 *
 * Single source of truth for every bike in RoadRush IQ.
 * To add a new bike: add one entry to BIKES. Nothing else changes.
 *
 * Each bike entry:
 *   id          – unique string key, used in registry & GameScreen
 *   name        – display name
 *   baseSpeed   – reserved for future per-bike tuning (not used yet)
 *   unlockCost  – reserved for shop system
 *   power       – null (no power) OR a power config object:
 *     type        – matches a key in PowerRegistry (see PowerUpManager)
 *     duration    – active time in milliseconds
 *     cooldown    – cooldown time in milliseconds
 *     activateKey – Phaser.Input.Keyboard.KeyCodes key
 *     label       – short display name for HUD
 *     color       – hex number for HUD / visual effects
 *     options     – any extra data the specific power needs
 */

export const BIKES = {
  skooter: {
    id:         'skooter',
    name:       'Skooter',
    baseSpeed:  null,   // uses scene default
    unlockCost: 0,
    power:      null,   // no power-up
  },

  aveengeer: {
    id:         'aveengeer',
    name:       'Aveengeer',
    baseSpeed:  null,
    unlockCost: 5000,
    power: {
      type:       'shield',
      duration:   6000,   // 6 seconds active
      cooldown:   25000,  // 25 seconds cooldown
      label:      'SHIELD',
      color:      0x00c3ff,
      options: {
        speedBoost: 80,   // added to scene.speed while shield is active
      },
    },
  },

  krossfire: {
    id:         'krossfire',
    name:       'Kross Fire',
    baseSpeed:  null,
    unlockCost: 8000,
    power: {
      type:       'magnet',
      duration:   8000,   // 8 seconds active
      cooldown:   27000,  // 35 seconds cooldown
      label:      'MAGNET',
      color:      0xf7c948,
      options: {
        radius:   180,    // attraction radius in pixels
        strength: 320,    // pixels per second pull speed
      },
    },
  },

  // ── Add future bikes here ──────────────────────────────────────────────
  // nitrobolt: {
  //   id: 'nitrobolt', name: 'Nitro Bolt', baseSpeed: null, unlockCost: 12000,
  //   power: { type: 'nitro', duration: 5000, cooldown: 20000,
  //            label: 'NITRO', color: 0xff6600, options: { multiplier: 2.5 } },
  // },
};

/**
 * getBikeConfig(id)
 * Returns the config for the given bike id, or Skooter as fallback.
 */
export function getBikeConfig(id) {
  return BIKES[id] ?? BIKES['skooter'];
}