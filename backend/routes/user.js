const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/me', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [req.user.id]);
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Progress: one row per user (upsert)
router.get('/progress', async (req, res) => {
  try {
    const result = await pool.query('SELECT level, score, data FROM progress WHERE user_id = $1', [req.user.id]);
    res.json({ progress: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/progress', async (req, res) => {
  const { level, score, data } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO progress (user_id, level, score, data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET level = EXCLUDED.level, score = EXCLUDED.score, data = EXCLUDED.data
       RETURNING level, score, data`,
      [req.user.id, level || 1, score || 0, data || {}]
    );
    res.json({ progress: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cars: list available cars
router.get('/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, price, metadata FROM cars ORDER BY id');
    res.json({ cars: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Purchase a car for the current user
router.post('/cars/purchase', async (req, res) => {
  const { car_id } = req.body;
  if (!car_id) return res.status(400).json({ error: 'car_id required' });
  try {
    const check = await pool.query('SELECT id FROM user_cars WHERE user_id = $1 AND car_id = $2', [req.user.id, car_id]);
    if (check.rows.length) return res.status(409).json({ error: 'Car already purchased' });
    await pool.query('INSERT INTO user_cars (user_id, car_id) VALUES ($1, $2)', [req.user.id, car_id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/purchases', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT uc.id, uc.purchased_at, c.id as car_id, c.name, c.price, c.metadata
       FROM user_cars uc
       JOIN cars c ON c.id = uc.car_id
       WHERE uc.user_id = $1`,
      [req.user.id]
    );
    res.json({ purchases: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
