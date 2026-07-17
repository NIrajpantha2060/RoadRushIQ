export const LEVELING = {
  baseXpPerLevel: 100,
};

export const UNLOCKS = {
  modes: [
    {
      id: 'one-way',
      label: 'One Way',
      sub: 'Same-direction traffic only',
      desc: 'All vehicles move with you. A cleaner opening route for longer runs.',
      requiredLevel: 1,
      requiredCoins: 0,
      defaultUnlocked: true,
    },
    {
      id: 'two-way',
      label: 'Two Way',
      sub: 'Oncoming + same-direction traffic',
      desc: 'Face oncoming vehicles head-on while navigating slower traffic behind you.',
      requiredLevel: 5,
      requiredCoins: 1000,
      defaultUnlocked: false,
      badge: 'Classic',
    },
  ],
  bikes: [
    {
      id: 'skooter',
      name: 'Skooter',
      tagline: 'The starter ride',
      requiredLevel: 1,
      requiredCoins: 0,
      defaultUnlocked: true,
      accentColor: '#f7931e',
      svgFill: '#f7931e',
      power: null,
    },
    {
      id: 'aveengeer',
      name: 'Avenger Bike',
      tagline: 'Built for the impossible',
      requiredLevel: 4,
      requiredCoins: 500,
      defaultUnlocked: false,
      accentColor: '#00c3ff',
      svgFill: '#00c3ff',
      power: {
        name: 'Shield',
        icon: 'shield',
        color: '#00c3ff',
        desc: '6s invincibility + speed boost · 25s cooldown',
      },
    },
    {
      id: 'krossfire',
      name: 'Kross Fire Bike',
      tagline: 'Coins come to you',
      requiredLevel: 7,
      requiredCoins: 1500,
      defaultUnlocked: false,
      accentColor: '#f7c948',
      svgFill: '#f7c948',
      power: {
        name: 'Magnet',
        icon: 'magnet',
        color: '#f7c948',
        desc: 'Pulls nearby coins for 8s · 35s cooldown',
      },
    },
  ],
};

export function getBikeById(bikeId) {
  return UNLOCKS.bikes.find((bike) => bike.id === bikeId) ?? UNLOCKS.bikes[0];
}

export function getModeById(modeId) {
  return UNLOCKS.modes.find((mode) => mode.id === modeId) ?? UNLOCKS.modes[0];
}

export function getUnlockedMap(unlocks = []) {
  return new Map(unlocks.map((unlock) => [unlock.id, unlock]));
}