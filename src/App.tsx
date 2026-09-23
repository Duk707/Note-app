import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Register } from './components/Register';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

export function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [session, setSession] = useState<Session | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error && isMounted) {
          setAuthError(error.message);
        } else if (isMounted) {
          setSession(data.session);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setAuthError(err instanceof Error ? err.message : 'Failed to retrieve auth session.');
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setAuthError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setSignOutLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(error.message);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'An error occurred during sign out.');
    } finally {
      setSignOutLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </div>
        <h1 className="app-title">Notes App</h1>
        <div className="status-badge">
          <span className="status-dot"></span>
          <span>
            {initialLoading
              ? 'Checking Authentication...'
              : session
              ? 'Step 7 - Read Notes'
              : 'Step 7 - Authentication Required'}
          </span>
        </div>
      </div>

      {authError && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
          <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{authError}</span>
        </div>
      )}

      {initialLoading ? (
        <div className="loading-container">
          <span className="spinner spinner-large"></span>
          <p className="loading-text">Loading authentication session...</p>
        </div>
      ) : session ? (
        <Dashboard
          userEmail={session.user.email ?? ''}
          onSignOut={handleSignOut}
          signOutLoading={signOutLoading}
        />
      ) : (
        <>
          <div className="auth-tab-bar">
            <button
              type="button"
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          {authMode === 'login' ? (
            <Login onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </>
      )}
    </div>
  );
}

export default App;



