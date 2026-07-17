const { LEVELING, UNLOCKS, getUnlockDefinition } = require('../config/progression');

function toNonNegativeInteger(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function scoreToXp(score) {
  return Math.floor(toNonNegativeInteger(score) / 10);
}

function xpRequiredForLevel(level) {
  if (level <= 1) {
    return 0;
  }

  const base = LEVELING.baseXpPerLevel;
  return base * (((level - 1) * level) / 2);
}

function levelFromTotalXp(totalXp) {
  const xp = toNonNegativeInteger(totalXp);
  const base = LEVELING.baseXpPerLevel;
  const level = Math.floor((1 + Math.sqrt(1 + ((8 * xp) / base))) / 2);
  return Math.max(1, level);
}

function buildProgressionSnapshot({ totalXp = 0, highestScore = 0, coins = 0, rank = null } = {}) {
  const normalizedTotalXp = toNonNegativeInteger(totalXp);
  const level = levelFromTotalXp(normalizedTotalXp);
  const currentLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  const currentXp = normalizedTotalXp - currentLevelXp;
  const xpForNextLevel = Math.max(0, nextLevelXp - normalizedTotalXp);
  const currentLevelCapacity = Math.max(1, nextLevelXp - currentLevelXp);

  return {
    level,
    totalXp: normalizedTotalXp,
    currentXp,
    currentLevelXp,
    nextLevelXp,
    xpForNextLevel,
    progressPercent: Math.min(100, Math.round((currentXp / currentLevelCapacity) * 100)),
    highestScore: toNonNegativeInteger(highestScore),
    coins: toNonNegativeInteger(coins),
    rank: rank == null ? null : Number(rank),
  };
}

function buildUnlockState(unlock, unlockedIds = []) {
  const isUnlocked = unlock.defaultUnlocked || unlockedIds.includes(unlock.id);
  return {
    ...unlock,
    isUnlocked,
    isLocked: !isUnlocked,
  };
}

function buildUnlockStates(unlockedIds = []) {
  return UNLOCKS.map((unlock) => buildUnlockState(unlock, unlockedIds));
}

function canAffordUnlock(profile, unlock) {
  if (!unlock) {
    return false;
  }

  return profile.level >= unlock.requiredLevel && profile.coins >= unlock.requiredCoins;
}

function normalizeUnlockedIds(rows = []) {
  return rows.map((row) => row.unlock_id);
}

module.exports = {
  scoreToXp,
  xpRequiredForLevel,
  levelFromTotalXp,
  buildProgressionSnapshot,
  buildUnlockState,
  buildUnlockStates,
  canAffordUnlock,
  normalizeUnlockedIds,
  getUnlockDefinition,
};