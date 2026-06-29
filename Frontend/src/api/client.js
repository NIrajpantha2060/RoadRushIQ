// src/api/client.js
// Axios instance — all backend calls go through here

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const client = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT to every request ───────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('rr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── If token expired → clear and reload ──────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rr_token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default client;