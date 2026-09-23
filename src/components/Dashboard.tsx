import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

interface DashboardProps {
  userEmail: string;
  onSignOut: () => void;
  signOutLoading: boolean;
}

export function Dashboard({ userEmail, onSignOut, signOutLoading }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('id, user_id, title, content, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setNotes((data as Note[]) || []);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while loading notes.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <div className="dashboard-card">
      <div className="dashboard-header-bar">
        <div className="dashboard-user-badge">
          <span className="user-dot"></span>
          <span className="dashboard-user-email">{userEmail}</span>
        </div>

        <button
          type="button"
          className="btn-danger-outline"
          onClick={onSignOut}
          disabled={signOutLoading}
        >
          {signOutLoading ? (
            <span className="button-spinner-wrapper">
              <span className="spinner"></span>
              Logging out...
            </span>
          ) : (
            'Log Out'
          )}
        </button>
      </div>

      <div className="dashboard-main-content">
        <div className="notes-header-row">
          <div>
            <h2 className="dashboard-title">Your Personal Notes</h2>
            <p className="dashboard-description">
              View your private notes stored securely in Supabase.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button type="button" className="btn-retry" onClick={fetchNotes}>
              Retry Loading Notes
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-container" style={{ padding: '2.5rem 1rem' }}>
            <span className="spinner spinner-large"></span>
            <p className="loading-text">Loading your notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="notes-empty-state">
            <div className="empty-icon-wrapper">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="empty-title">No Notes Found</h3>
            <p className="empty-desc">
              You don't have any notes saved yet. Notes created in future steps will appear here.
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <h3 className="note-title">{note.title}</h3>
                <p className="note-content">{note.content}</p>
                <div className="note-footer">
                  <span className="note-date">
                    {new Date(note.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
