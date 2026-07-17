// routes/stats.js — Game stats endpoints
const express = require('express');
const auth    = require('../middleware/auth');
const pool    = require('../db');
const progressionController = require('../controllers/progressionController');

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

  // Validate inputs
  if (!day || !type || !amount) {
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

  const expected = VALID_REWARDS[day];
  if (!expected || expected.type !== type || expected.amount !== amount) {
    return res.status(400).json({ error: 'Invalid reward claim' });
  }

  try {
    // Get current stats
    const current = await pool.query(
      `SELECT day_streak, last_claim_date, claimed_days
       FROM player_stats WHERE user_id = $1`,
      [req.user.id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Player stats not found' });
    }

    const stats       = current.rows[0];
    const today       = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastClaim   = stats.last_claim_date
      ? new Date(stats.last_claim_date).toISOString().split('T')[0]
      : null;
    const claimedDays = stats.claimed_days ?? [];

    // Already claimed today?
    if (lastClaim === today) {
      return res.status(400).json({ error: 'Already claimed today' });
    }

    // Already claimed this day number?
    if (claimedDays.includes(day)) {
      return res.status(400).json({ error: `Day ${day} already claimed` });
    }

    // Check streak continuity
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];

    let newStreak    = stats.day_streak ?? 1;
    let newClaimed   = [...claimedDays, day];

    // If last claim wasn't yesterday → reset streak
    if (lastClaim !== yStr && lastClaim !== null) {
      newStreak  = 1;
      newClaimed = [day];
    }

    // Figure out next day
    const nextDay = day < 7 ? day + 1 : 1;

    // Build the currency update
    let coinDelta = 0, blueDelta = 0, redDelta = 0;
    if (type === 'coins') coinDelta = amount;
    if (type === 'blue')  blueDelta = amount;
    if (type === 'red')   redDelta  = amount;

    const updated = await pool.query(
      `UPDATE player_stats SET
         coins         = coins + $1,
         blue_diamonds = blue_diamonds + $2,
         red_diamonds  = red_diamonds + $3,
         day_streak    = $4,
         last_claim_date = $5,
         claimed_days  = $6::jsonb
       WHERE user_id = $7
       RETURNING coins, blue_diamonds, red_diamonds, day_streak, claimed_days`,
      [coinDelta, blueDelta, redDelta, newStreak, today, JSON.stringify(newClaimed), req.user.id]
    );

    res.json({
      message:    'Reward claimed!',
      nextDay,
      claimedDay: day,
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