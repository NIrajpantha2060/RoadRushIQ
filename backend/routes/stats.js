// routes/stats.js — Game stats endpoints
const express = require('express');
const auth    = require('../middleware/auth');
const pool    = require('../db');
const progressionController = require('../controllers/progressionController');
const progressionService = require('../services/progressionService');

const router = express.Router();

// All routes here require a valid JWT
router.use(auth);

// ── 1. Get full player profile ────────────────────────────
// GET /api/stats/profile
router.get('/profile', progressionController.getProfile);

// ── 2. Save a completed run ───────────────────────────────
// Called when game over screen appears
// POST /api/stats/save-run
// Body: { score, coins, blueDiamonds, redDiamonds, mode, bikeUsed }
router.post('/save-run', progressionController.saveRun);

// ── 3b. Unlock an item ────────────────────────────────────
// POST /api/stats/unlock
// Body: { unlockId }
router.post('/unlock', progressionController.unlockItem);

// ── 3. Claim daily reward ─────────────────────────────────
// POST /api/stats/daily-claim
// Body: { day, type, amount }  — validated server-side
router.post('/daily-claim', async (req, res) => {
  const { day, type, amount } = req.body;
  const rewardDay = Number(day);
  const rewardAmount = Number(amount);

  const toIsoDate = (value) => (value ? new Date(value).toISOString().split('T')[0] : null);
  const getNextDay = (currentDay) => (currentDay < 7 ? currentDay + 1 : 1);

  // Validate inputs
  if (!rewardDay || !type || !rewardAmount) {
    return res.status(400).json({ error: 'Missing day, type or amount' });
  }

  const VALID_REWARDS = {
    1: { type: 'coins', amount: 500  },
    2: { type: 'blue',  amount: 5    },
    3: { type: 'coins', amount: 1200 },
    4: { type: 'blue',  amount: 15   },
    5: { type: 'coins', amount: 2500 },
    6: { type: 'blue',  amount: 30   },
    7: { type: 'red',   amount: 3    },
  };

  const expected = VALID_REWARDS[rewardDay];
  if (!expected || expected.type !== type || expected.amount !== rewardAmount) {
    return res.status(400).json({ error: 'Invalid reward claim' });
  }

  try {
    // Get current stats
    const current = await pool.query(
      `SELECT day_streak, last_claim_at, last_claim_date, claimed_days
       FROM player_stats WHERE user_id = $1`,
      [req.user.id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Player stats not found' });
    }

    const stats       = current.rows[0];
    const now         = new Date();
    const lastClaimAt = stats.last_claim_at
      ? new Date(stats.last_claim_at)
      : (stats.last_claim_date ? new Date(stats.last_claim_date) : null);
    const nextAvailableAt = lastClaimAt ? new Date(lastClaimAt.getTime() + 86400000) : null;
    const claimedDays = Array.isArray(stats.claimed_days) ? stats.claimed_days.map(Number) : [];

    // Still within the 24-hour cooldown window?
    if (nextAvailableAt && now < nextAvailableAt) {
      return res.status(400).json({
        error: 'Reward already claimed. Come back tomorrow.',
        nextAvailableAt: nextAvailableAt.toISOString(),
      });
    }

    const expectedDay = lastClaimAt ? getNextDay(stats.day_streak ?? 1) : 1;

    if (rewardDay !== expectedDay) {
      return res.status(400).json({ error: `Day ${expectedDay} is the next claimable reward` });
    }

    const newStreak = expectedDay;
    const newClaimed = expectedDay !== 1
      ? [...claimedDays, rewardDay]
      : [rewardDay];

    // Figure out the next day in the seven-day loop.
    const nextDay = getNextDay(expectedDay);

    // Build the currency update
    let coinDelta = 0, blueDelta = 0, redDelta = 0;
    if (type === 'coins') coinDelta = rewardAmount;
    if (type === 'blue')  blueDelta = rewardAmount;
    if (type === 'red')   redDelta  = rewardAmount;

    const updated = await pool.query(
      `UPDATE player_stats SET
         coins         = coins + $1,
         blue_diamonds = blue_diamonds + $2,
         red_diamonds  = red_diamonds + $3,
         day_streak    = $4,
           last_claim_at = $5,
           last_claim_date = $6,
           claimed_days  = $7::jsonb
         WHERE user_id = $8
         RETURNING coins, blue_diamonds, red_diamonds, day_streak, last_claim_at, claimed_days`,
        [coinDelta, blueDelta, redDelta, newStreak, now, now.toISOString().split('T')[0], JSON.stringify(newClaimed), req.user.id]
    );

    const profile = await progressionService.getProfile(req.user.id);
    const nextClaimAt = updated.rows[0]?.last_claim_at
      ? new Date(updated.rows[0].last_claim_at.getTime() + 86400000)
      : null;

    res.json({
      message:    'Reward claimed!',
      nextDay,
      claimedDay: rewardDay,
      nextAvailableAt: nextClaimAt ? nextClaimAt.toISOString() : null,
      profile,
      stats:      updated.rows[0],
    });
  } catch (err) {
    console.error('POST /daily-claim error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── 4. Update selected bike ───────────────────────────────
// POST /api/stats/select-bike
// Body: { bikeId }
router.post('/select-bike', progressionController.selectBike);

// ── 5. Leaderboard (top 20 scores) ───────────────────────
// GET /api/stats/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.display_name, u.avatar_url,
         ps.best_score, ps.total_runs, ps.selected_bike,
         DENSE_RANK() OVER (
           ORDER BY ps.best_score DESC, ps.total_xp DESC, ps.updated_at ASC, ps.user_id ASC
         ) AS rank
       FROM player_stats ps
       JOIN users u ON u.id = ps.user_id
       ORDER BY ps.best_score DESC
       LIMIT 20`
    );
    res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error('GET /leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;