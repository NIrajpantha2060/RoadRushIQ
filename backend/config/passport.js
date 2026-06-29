// config/passport.js — Google OAuth strategy
const passport      = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool          = require('../db');
require('dotenv').config();

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId   = profile.id;
      const email      = profile.emails?.[0]?.value ?? '';
      const name       = profile.displayName ?? '';
      const avatar     = profile.photos?.[0]?.value ?? '';

      // Check if user already exists
      const existing = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
      );

      if (existing.rows.length > 0) {
        // Update name/avatar in case they changed
        const updated = await pool.query(
          `UPDATE users
           SET display_name = $1, avatar_url = $2
           WHERE google_id = $3
           RETURNING *`,
          [name, avatar, googleId]
        );
        return done(null, updated.rows[0]);
      }

      // New user — insert into users + create their stats row
      const newUser = await pool.query(
        `INSERT INTO users (google_id, email, display_name, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [googleId, email, name, avatar]
      );

      const user = newUser.rows[0];

      // Create default player_stats row
      await pool.query(
        `INSERT INTO player_stats (user_id)
         VALUES ($1)`,
        [user.id]
      );

      return done(null, user);
    } catch (err) {
      console.error('Passport Google error:', err);
      return done(err, null);
    }
  }
));

// Not using sessions (JWT instead) — these are still required by passport
passport.serializeUser((user, done)   => done(null, user.id));
passport.deserializeUser((id, done)   => done(null, { id }));

module.exports = passport;