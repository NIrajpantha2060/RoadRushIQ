const pool = require('../db');

async function ensurePlayerStats(client, userId) {
  await client.query(
    `INSERT INTO player_stats (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

async function seedDefaultUnlocks(client, userId, defaultUnlockIds = []) {
  if (defaultUnlockIds.length === 0) {
    return;
  }

  for (const unlockId of defaultUnlockIds) {
    await client.query(
      `INSERT INTO player_unlocks (user_id, unlock_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, unlock_id) DO NOTHING`,
      [userId, unlockId]
    );
  }
}

async function getPlayerProfile(client, userId) {
  const result = await client.query(
    `WITH ranked AS (
       SELECT
         user_id,
         DENSE_RANK() OVER (
           ORDER BY best_score DESC, total_xp DESC, updated_at ASC, user_id ASC
         ) AS rank
       FROM player_stats
     )
     SELECT
       u.id, u.username, u.display_name, u.avatar_url, u.created_at,
       ps.coins, ps.blue_diamonds, ps.red_diamonds,
       ps.best_score AS highest_score,
       ps.total_runs, ps.total_coins_ever,
       ps.total_xp, ps.level,
       ps.selected_bike, ps.day_streak,
       ps.last_claim_at,
       ps.last_claim_date,
       CASE
         WHEN COALESCE(ps.last_claim_at, ps.last_claim_date::timestamp) IS NOT NULL
         THEN COALESCE(ps.last_claim_at, ps.last_claim_date::timestamp) + INTERVAL '1 day'
         ELSE NULL
       END AS next_available_at,
       ps.claimed_days,
       ranked.rank
     FROM users u
     JOIN player_stats ps ON ps.user_id = u.id
     JOIN ranked ON ranked.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );

  return result.rows[0] ?? null;
}

async function getUnlockedIds(client, userId) {
  const result = await client.query(
    `SELECT unlock_id
     FROM player_unlocks
     WHERE user_id = $1
     ORDER BY unlocked_at ASC`,
    [userId]
  );

  return result.rows.map((row) => row.unlock_id);
}

async function recordRun(client, { userId, score, coins, blueDiamonds, redDiamonds, xpEarned, levelNumber, mode, bikeUsed }) {
  await client.query(
    `INSERT INTO run_history
       (user_id, score, coins, blue_diamonds, red_diamonds, mode, bike_used)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, score, coins, blueDiamonds, redDiamonds, mode, bikeUsed]
  );

  return client.query(
    `UPDATE player_stats SET
       coins            = coins + $1,
       blue_diamonds    = blue_diamonds + $2,
       red_diamonds     = red_diamonds + $3,
       best_score       = GREATEST(best_score, $4),
       total_runs       = total_runs + 1,
       total_coins_ever = total_coins_ever + $1,
       total_xp         = total_xp + $5,
       level            = $6
     WHERE user_id = $7
     RETURNING coins, blue_diamonds, red_diamonds, best_score, total_runs, total_coins_ever, total_xp, level`,
    [coins, blueDiamonds, redDiamonds, score, xpEarned, levelNumber, userId]
  );
}

async function spendForUnlock(client, { userId, requiredCoins }) {
  return client.query(
    `UPDATE player_stats
     SET coins = coins - $1
     WHERE user_id = $2 AND coins >= $1
     RETURNING coins, total_xp, level, best_score`,
    [requiredCoins, userId]
  );
}

async function insertUnlock(client, userId, unlockId) {
  return client.query(
    `INSERT INTO player_unlocks (user_id, unlock_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, unlock_id) DO NOTHING
     RETURNING unlock_id`,
    [userId, unlockId]
  );
}

async function setSelectedBike(client, userId, bikeId) {
  return client.query(
    `UPDATE player_stats
     SET selected_bike = $1
     WHERE user_id = $2
     RETURNING selected_bike`,
    [bikeId, userId]
  );
}

async function withClient(handler) {
  const client = await pool.connect();
  try {
    return await handler(client);
  } finally {
    client.release();
  }
}

module.exports = {
  withClient,
  ensurePlayerStats,
  seedDefaultUnlocks,
  getPlayerProfile,
  getUnlockedIds,
  recordRun,
  spendForUnlock,
  insertUnlock,
  setSelectedBike,
};