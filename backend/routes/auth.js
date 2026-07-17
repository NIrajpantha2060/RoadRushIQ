// routes/auth.js — username/password auth
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const auth    = require('../middleware/auth');
const pool    = require('../db');
const progressionService = require('../services/progressionService');
require('dotenv').config();

const router = express.Router();
const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// ── POST /auth/signup ─────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be 3–30 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2) RETURNING *`,
      [username, password_hash]
    );
    const user = result.rows[0];

    // Create default player_stats row
    await pool.query(
      'INSERT INTO player_stats (user_id) VALUES ($1)',
      [user.id]
    );

    const token = signToken(user);
    res.status(201).json({ token, username: user.username });
  } catch (err) {
    console.error('POST /signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken(user);
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('POST /login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /auth/me ──────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await progressionService.getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: profile });
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/logout ─────────────────────────────────────
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out. Delete your token on the client.' });
});

module.exports = router;