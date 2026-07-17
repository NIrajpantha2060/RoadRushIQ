const LEVELING = {
  baseXpPerLevel: 100,
};

const UNLOCKS = [
  {
    id: 'one-way',
    type: 'mode',
    label: 'One Way Mode',
    description: 'Free starter mode',
    requiredLevel: 1,
    requiredCoins: 0,
    defaultUnlocked: true,
  },
  {
    id: 'two-way',
    type: 'mode',
    label: 'Two Way Mode',
    description: 'Oncoming traffic challenge',
    requiredLevel: 5,
    requiredCoins: 1000,
    defaultUnlocked: false,
  },
  {
    id: 'skooter',
    type: 'bike',
    label: 'Skooter',
    description: 'Starter bike',
    requiredLevel: 1,
    requiredCoins: 0,
    defaultUnlocked: true,
  },
  {
    id: 'aveengeer',
    type: 'bike',
    label: 'Avenger Bike',
    description: 'Shield power cruiser',
    requiredLevel: 4,
    requiredCoins: 500,
    defaultUnlocked: false,
  },
  {
    id: 'krossfire',
    type: 'bike',
    label: 'Kross Fire Bike',
    description: 'Magnet power cruiser',
    requiredLevel: 7,
    requiredCoins: 1500,
    defaultUnlocked: false,
  },
];

function getUnlockDefinition(unlockId) {
  return UNLOCKS.find((unlock) => unlock.id === unlockId) ?? null;
}

module.exports = {
  LEVELING,
  UNLOCKS,
  getUnlockDefinition,
};