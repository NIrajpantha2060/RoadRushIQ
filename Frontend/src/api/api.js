// src/api/api.js
import client from './client';

// ── AUTH ──────────────────────────────────────────────────

export async function signup(username, password) {
  const res = await client.post('/auth/signup', { username, password });
  const { token } = res.data;
  localStorage.setItem('rr_token', token);
  return res.data;
}

export async function login(username, password) {
  const res = await client.post('/auth/login', { username, password });
  const { token } = res.data;
  localStorage.setItem('rr_token', token);
  return res.data;
}

export async function getMe() {
  const res = await client.get('/auth/me');
  return res.data.user;
}

export function logout() {
  localStorage.removeItem('rr_token');
  window.location.href = '/';
}

// ── STATS ─────────────────────────────────────────────────

export async function getProfile() {
  const res = await client.get('/api/stats/profile');
  return res.data.profile;
}

export async function saveRun({ score, coins, blueDiamonds, redDiamonds, mode, bikeUsed }) {
  const res = await client.post('/api/stats/save-run', {
    score, coins, blueDiamonds, redDiamonds, mode, bikeUsed,
  });
  return res.data;
}

export async function unlockItem(unlockId) {
  const res = await client.post('/api/stats/unlock', { unlockId });
  return res.data;
}

export async function claimDailyReward({ day, type, amount }) {
  const res = await client.post('/api/stats/daily-claim', { day, type, amount });
  return res.data;
}

export async function selectBike(bikeId) {
  const res = await client.post('/api/stats/select-bike', { bikeId });
  return res.data;
}

export async function getLeaderboard() {
  const res = await client.get('/api/stats/leaderboard');
  return res.data.leaderboard;
}