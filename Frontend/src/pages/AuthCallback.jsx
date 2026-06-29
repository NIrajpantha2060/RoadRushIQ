// src/pages/AuthCallback.jsx
// Google OAuth redirects here with ?token=xxx
// We save the token and redirect to home

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (token) {
      localStorage.setItem('rr_token', token);
    }

    // Go to home regardless
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      height:         '100svh',
      background:     '#07090f',
      color:          '#ffffff',
      fontFamily:     'system-ui, sans-serif',
      fontSize:       '16px',
    }}>
      Signing you in…
    </div>
  );
}