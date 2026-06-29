// server.js
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const authRoutes  = require('./routes/auth');
const statsRoutes = require('./routes/stats');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin:      process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth',      authRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const pool = require('./db');
pool.ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀  RoadRushIQ backend running on http://localhost:${PORT}`);
    });
  })
  .catch(() => process.exit(1));