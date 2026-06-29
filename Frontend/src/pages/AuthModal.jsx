import React, { useState } from 'react';
import '../css/ModeSelectModal.css';

function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      const url = mode === 'login' ? `${API}/auth/login` : `${API}/auth/register`;
      const body = mode === 'login' ? { email, password } : { email, password, name };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      // Expect { token, user }
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  return (
    <div className="ms-root" role="dialog" aria-modal="true">
      <div className="ms-panel">
        <header className="ms-header">
          <h3>{mode === 'login' ? 'Login' : 'Register'}</h3>
          <div className="ms-tabs">
            <button className={mode==='login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button className={mode==='register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>
        </header>

        <form className="ms-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </label>
          {error && <div className="ms-error">{error}</div>}
          <div className="ms-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{mode === 'login' ? 'Login' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
