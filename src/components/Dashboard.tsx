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

  // Note editing states
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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
        setCreateError(insertError.message);
      } else if (data && data.length > 0) {
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

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditTitle('');
    setEditContent('');
    setEditError(null);
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteId) return;

    setEditError(null);

    if (!editTitle.trim() || !editContent.trim()) {
      setEditError('Please enter both a title and content for your note.');
      return;
    }

    setEditLoading(true);

    try {
      const updatedAtIso = new Date().toISOString();
      const { data, error: updateError } = await supabase
        .from('notes')
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
          updated_at: updatedAtIso,
        })
        .eq('id', editingNoteId)
        .eq('user_id', userId)
        .select('id, user_id, title, content, created_at, updated_at');

      if (updateError) {
        // Preserve edited title & content input so user can retry upon failure!
        setEditError(updateError.message);
      } else if (data && data.length > 0) {
        // Only update local state and exit edit mode AFTER Supabase confirms success
        const updatedNote = data[0] as Note;
        setNotes((prevNotes) =>
          prevNotes.map((n) => (n.id === editingNoteId ? updatedNote : n))
        );
        setEditingNoteId(null);
        setEditTitle('');
        setEditContent('');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditError(err.message);
      } else {
        setEditError('An unexpected error occurred while updating the note.');
      }
    } finally {
      setEditLoading(false);
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
                {editingNoteId === note.id ? (
                  <form onSubmit={handleUpdateNote} className="note-card-edit-form" noValidate>
                    <h4 className="edit-form-title">Edit Note</h4>

                    {editError && (
                      <div className="alert alert-error" role="alert" style={{ marginBottom: '0.75rem', padding: '0.75rem' }}>
                        <span>{editError}</span>
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor={`edit-title-${note.id}`} className="form-label">
                        Title
                      </label>
                      <input
                        id={`edit-title-${note.id}`}
                        type="text"
                        className="form-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        disabled={editLoading}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`edit-content-${note.id}`} className="form-label">
                        Content
                      </label>
                      <textarea
                        id={`edit-content-${note.id}`}
                        className="form-input form-textarea"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        disabled={editLoading}
                        required
                      />
                    </div>

                    <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCancelEdit}
                        disabled={editLoading}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ marginTop: 0 }}
                        disabled={editLoading}
                      >
                        {editLoading ? (
                          <span className="button-spinner-wrapper">
                            <span className="spinner"></span>
                            Saving...
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="note-card-header">
                      <h3 className="note-title">{note.title}</h3>
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => handleStartEdit(note)}
                        title="Edit Note"
                      >
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        <span>Edit</span>
                      </button>
                    </div>

                    <p className="note-content">{note.content}</p>

                    <div className="note-footer">
                      <div className="note-dates-wrapper">
                        <span className="note-date">
                          Created:{' '}
                          {new Date(note.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {note.updated_at && note.updated_at !== note.created_at && (
                          <span className="note-updated-tag">
                            (Updated:{' '}
                            {new Date(note.updated_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                            )
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
