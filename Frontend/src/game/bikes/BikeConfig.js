

import { UNLOCKS } from '../progressionConfig';

function getBikeUnlockCost(bikeId) {
  return UNLOCKS.bikes.find((bike) => bike.id === bikeId)?.requiredCoins ?? 0;
}

export const BIKES = {
  skooter: {
    id:         'skooter',
    name:       'Skooter',
    baseSpeed:  null,   // uses scene default
    unlockCost: getBikeUnlockCost('skooter'),
    power:      null,   // no power-up
  },

  aveengeer: {
    id:         'aveengeer',
    name:       'Aveengeer',
    baseSpeed:  null,
    unlockCost: getBikeUnlockCost('aveengeer'),
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
    unlockCost: getBikeUnlockCost('krossfire'),
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