const { UNLOCKS, getUnlockDefinition } = require('../config/progression');
const {
  scoreToXp,
  buildProgressionSnapshot,
  buildUnlockStates,
  canAffordUnlock,
  levelFromTotalXp,
} = require('../utils/progression');
const {
  withClient,
  ensurePlayerStats,
  seedDefaultUnlocks,
  getPlayerProfile,
  getUnlockedIds,
  recordRun,
  spendForUnlock,
  insertUnlock,
  setSelectedBike,
} = require('../models/progressionModel');

function toProfilePayload(profileRow, unlockIds = []) {
  if (!profileRow) {
    return null;
  }

  const progression = buildProgressionSnapshot({
    totalXp: profileRow.total_xp,
    highestScore: profileRow.highest_score,
    coins: profileRow.coins,
    rank: profileRow.rank,
  });

  return {
    ...profileRow,
    progression,
    unlocks: buildUnlockStates(unlockIds),
  };
}

async function loadPlayerSnapshot(userId, client) {
  const profileRow = await getPlayerProfile(client, userId);
  if (!profileRow) {
    return null;
  }

  const unlockedIds = await getUnlockedIds(client, userId);
  return toProfilePayload(profileRow, unlockedIds);
}

async function ensurePlayerReady(client, userId) {
  await ensurePlayerStats(client, userId);
  await seedDefaultUnlocks(
    client,
    userId,
    UNLOCKS.filter((unlock) => unlock.defaultUnlocked).map((unlock) => unlock.id)
  );
}

async function getProfile(userId) {
  return withClient(async (client) => {
    await ensurePlayerReady(client, userId);
    return loadPlayerSnapshot(userId, client);
  });
}

async function saveRun(userId, runInput) {
  return withClient(async (client) => {
    await client.query('BEGIN');
    try {
      await ensurePlayerReady(client, userId);

      const score = Number.parseInt(runInput.score, 10) || 0;
      const coins = Number.parseInt(runInput.coins, 10) || 0;
      const blueDiamonds = Number.parseInt(runInput.blueDiamonds, 10) || 0;
      const redDiamonds = Number.parseInt(runInput.redDiamonds, 10) || 0;
      const mode = runInput.mode || 'two-way';
      const bikeUsed = runInput.bikeUsed || 'skooter';
      const xpEarned = scoreToXp(score);
      const currentSnapshot = await loadPlayerSnapshot(userId, client);
      const nextTotalXp = (currentSnapshot?.progression?.totalXp ?? 0) + xpEarned;
      const nextLevel = levelFromTotalXp(nextTotalXp);

      await recordRun(client, {
        userId,
        score,
        coins,
        blueDiamonds,
        redDiamonds,
        xpEarned,
        levelNumber: nextLevel,
        mode,
        bikeUsed,
      });

      const snapshot = await loadPlayerSnapshot(userId, client);
      await client.query('COMMIT');
      return snapshot;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

async function unlockItem(userId, unlockId) {
  return withClient(async (client) => {
    await client.query('BEGIN');
    try {
      await ensurePlayerReady(client, userId);

      const unlock = getUnlockDefinition(unlockId);
      if (!unlock) {
        const error = new Error('Unknown unlock');
        error.statusCode = 404;
        throw error;
      }

      const snapshot = await loadPlayerSnapshot(userId, client);
      if (!snapshot) {
        const error = new Error('Player not found');
        error.statusCode = 404;
        throw error;
      }

      if (snapshot.unlocks.find((item) => item.id === unlockId)?.isUnlocked) {
        await client.query('COMMIT');
        return snapshot;
      }

      if (!canAffordUnlock(snapshot.progression, unlock)) {
        const error = new Error('Unlock requirements not met');
        error.statusCode = 400;
        error.details = {
          requiredLevel: unlock.requiredLevel,
          requiredCoins: unlock.requiredCoins,
        };
        throw error;
      }

      const spendResult = await spendForUnlock(client, {
        userId,
        requiredCoins: unlock.requiredCoins,
      });

      if (spendResult.rowCount === 0) {
        const error = new Error('Insufficient coins');
        error.statusCode = 400;
        throw error;
      }

      await insertUnlock(client, userId, unlockId);
      const updatedSnapshot = await loadPlayerSnapshot(userId, client);

      await client.query('COMMIT');
      return updatedSnapshot;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

async function selectBike(userId, bikeId) {
  return withClient(async (client) => {
    await client.query('BEGIN');
    try {
      await ensurePlayerReady(client, userId);

      const unlock = getUnlockDefinition(bikeId);
      if (!unlock || unlock.type !== 'bike') {
        const error = new Error('Invalid bike');
        error.statusCode = 400;
        throw error;
      }

      const snapshot = await loadPlayerSnapshot(userId, client);
      const isUnlocked = snapshot.unlocks.find((item) => item.id === bikeId)?.isUnlocked;
      if (!isUnlocked) {
        const error = new Error('Bike is locked');
        error.statusCode = 403;
        error.details = {
          requiredLevel: unlock.requiredLevel,
          requiredCoins: unlock.requiredCoins,
        };
        throw error;
      }

      await setSelectedBike(client, userId, bikeId);
      const updatedSnapshot = await loadPlayerSnapshot(userId, client);
      await client.query('COMMIT');
      return updatedSnapshot;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

module.exports = {
  getProfile,
  saveRun,
  unlockItem,
  selectBike,
};