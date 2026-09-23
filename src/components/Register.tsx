import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface RegisterProps {
  onSwitchToLogin?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Register({ onSwitchToLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions if an operation is already pending
    if (loading) return;

    setError(null);
    setRegisteredEmail(null);

    const trimmedEmail = email.trim();

    // Client-side validation
    if (!trimmedEmail || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. user@example.com).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (signUpError) {
        // Preserves input values so user can fix and retry
        setError(signUpError.message);
      } else if (data.user) {
        setRegisteredEmail(data.user.email || trimmedEmail);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError('An unexpected error occurred during registration. Please try again.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('A network or unexpected error occurred. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Create an Account</h2>
      <p className="auth-subtitle">Register to start organizing your personal notes.</p>

      {error && (
        <div className="alert alert-error" role="alert">
          <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {registeredEmail ? (
        <div className="alert alert-success" role="status">
          <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>

          <div>
            <strong>Registration successful!</strong>
            <p style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>
              Account created for <code>{registeredEmail}</code>. You are now registered and authenticated.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
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
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="button-spinner-wrapper">
                <span className="spinner"></span>
                Creating account...
              </span>
            ) : (
              'Register Account'
            )}
          </button>
        </form>
      )}

      {onSwitchToLogin && (
        <p className="auth-footer-text">
          Already have an account?{' '}
          <button
            type="button"
            className="auth-link-button"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Log In
          </button>
        </p>
      )}
    </div>
  );
}

export default Register;
