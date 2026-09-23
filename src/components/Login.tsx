import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onSwitchToRegister?: () => void;
}

export function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoggedInEmail(null);

    // Client-side validation
    if (!email.trim() || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else if (data.user) {
        setLoggedInEmail(data.user.email || email.trim());
        setEmail('');
        setPassword('');
      } else {
        setError('An unexpected error occurred during login.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Log in to your account to access your personal notes.</p>

      {error && (
        <div className="alert alert-error" role="alert">
          <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loggedInEmail ? (
        <div className="alert alert-success" role="status">
          <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>

          <div>
            <strong>Login successful!</strong>
            <p style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>
              Authenticated as <code>{loggedInEmail}</code>.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="button-spinner-wrapper">
                <span className="spinner"></span>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      )}

      {onSwitchToRegister && (
        <p className="auth-footer-text">
          Don't have an account?{' '}
          <button type="button" className="auth-link-button" onClick={onSwitchToRegister}>
            Register
          </button>
        </p>
      )}
    </div>
  );
}

export default Login;
