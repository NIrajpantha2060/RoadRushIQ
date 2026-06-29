// src/pages/LoginScreen.jsx
import React, { useState } from 'react';
import { login, signup } from '../api/api';
import '../css/LoginScreen.css';

export default function LoginScreen({ onAuthSuccess }) {
  const [mode,     setMode]     = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        await signup(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="ls-root">
      <div className="ls-glow ls-glow--a" aria-hidden="true" />
      <div className="ls-glow ls-glow--b" aria-hidden="true" />

      <div className="ls-road" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="ls-road__dash" />
        ))}
      </div>

      <div className="ls-card">
        <div className="ls-logo">
          <span className="ls-logo__road">ROAD</span>
          <span className="ls-logo__rush">RUSH</span>
          <span className="ls-logo__iq">IQ</span>
        </div>

        <p className="ls-tagline">Dodge traffic. Collect coins. Prove your IQ.</p>

        <div className="ls-tabs" role="tablist">
          <button
            className={`ls-tab${!isSignup ? ' ls-tab--active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
            role="tab"
            aria-selected={!isSignup}
          >
            Log in
          </button>
          <button
            className={`ls-tab${isSignup ? ' ls-tab--active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
            role="tab"
            aria-selected={isSignup}
          >
            Sign up
          </button>
        </div>

        <div className="ls-form">
          <div className="ls-field">
            <label className="ls-field__label" htmlFor="ls-username">Username</label>
            <input
              id="ls-username"
              className="ls-field__input"
              type="text"
              placeholder="e.g. speedking99"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="ls-field">
            <label className="ls-field__label" htmlFor="ls-password">Password</label>
            <input
              id="ls-password"
              className="ls-field__input"
              type="password"
              placeholder={isSignup ? 'Min 6 characters' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <p className="ls-error" role="alert">{error}</p>
          )}

          <button
            className="ls-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}