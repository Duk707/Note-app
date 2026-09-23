import React, { useState, useEffect, useCallback } from 'react';
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
  userId: string;
  userEmail: string;
  onSignOut: () => void;
  signOutLoading: boolean;
}

export function Dashboard({ userId, userEmail, onSignOut, signOutLoading }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note creation states
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    // Validation
    if (!newTitle.trim() || !newContent.trim()) {
      setCreateError('Please enter both a title and content for your note.');
      return;
    }

    setCreateLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('notes')
        .insert([
          {
            title: newTitle.trim(),
            content: newContent.trim(),
            user_id: userId,
          },
        ])
        .select('id, user_id, title, content, created_at, updated_at');

      if (insertError) {
        // Preserve user's title & content input so they can retry upon failure!
        setCreateError(insertError.message);
      } else if (data && data.length > 0) {
        // Only clear title/content and close creation view AFTER insertion succeeds
        setNotes((prevNotes) => [data[0] as Note, ...prevNotes]);
        setNewTitle('');
        setNewContent('');
        setIsCreating(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError('An unexpected error occurred while creating your note.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

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
              Create and manage your private notes stored securely in Supabase.
            </p>
          </div>

          {!isCreating && (
            <button
              type="button"
              className="btn-add-note"
              onClick={() => {
                setCreateError(null);
                setIsCreating(true);
              }}
            >
              + Create Note
            </button>
          )}
        </div>

        {isCreating && (
          <div className="create-note-card">
            <h3 className="create-note-title">New Note</h3>

            {createError && (
              <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>
                <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateNote} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="note-title" className="form-label">
                  Title
                </label>
                <input
                  id="note-title"
                  type="text"
                  className="form-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Note Title"
                  disabled={createLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="note-content" className="form-label">
                  Content
                </label>
                <textarea
                  id="note-content"
                  className="form-input form-textarea"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your note content here..."
                  rows={4}
                  disabled={createLoading}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setCreateError(null);
                    setIsCreating(false);
                  }}
                  disabled={createLoading}
                >
                  Cancel
                </button>

                <button type="submit" className="btn-primary" style={{ marginTop: 0 }} disabled={createLoading}>
                  {createLoading ? (
                    <span className="button-spinner-wrapper">
                      <span className="spinner"></span>
                      Saving note...
                    </span>
                  ) : (
                    'Save Note'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

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
        ) : notes.length === 0 && !isCreating ? (
          <div className="notes-empty-state">
            <div className="empty-icon-wrapper">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="empty-title">No Notes Found</h3>
            <p className="empty-desc">
              You don't have any notes saved yet. Click "+ Create Note" above to add your first note!
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
