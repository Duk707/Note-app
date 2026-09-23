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

  // Note deletion states
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isAnyMutationActive = createLoading || editLoading || deleteLoadingId !== null;

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
        setError('A network error occurred while loading notes. Please check your connection and retry.');
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

    // Prevent duplicate submission at logic level
    if (createLoading) return;

    setCreateError(null);

    const trimmedTitle = newTitle.trim();
    const trimmedContent = newContent.trim();

    // Validation
    if (!trimmedTitle || !trimmedContent) {
      setCreateError('Please enter both a title and content for your note.');
      return;
    }

    setCreateLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('notes')
        .insert([
          {
            title: trimmedTitle,
            content: trimmedContent,
            user_id: userId,
          },
        ])
        .select('id, user_id, title, content, created_at, updated_at');

      if (insertError) {
        // Preserves typed title & content so user can fix and retry upon failure
        setCreateError(insertError.message);
      } else if (data && data.length > 0) {
        setNotes((prevNotes) => [data[0] as Note, ...prevNotes]);
        setNewTitle('');
        setNewContent('');
        setIsCreating(false);
      } else {
        setCreateError('Failed to create note. Please try again.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError('An unexpected network error occurred while creating your note.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStartEdit = (note: Note) => {
    if (isAnyMutationActive) return;
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditError(null);
    setDeletingNoteId(null);
    setDeleteError(null);
  };

  const handleCancelEdit = () => {
    if (editLoading) return;
    setEditingNoteId(null);
    setEditTitle('');
    setEditContent('');
    setEditError(null);
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteId || editLoading) return;

    setEditError(null);

    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      setEditError('Please enter both a title and content for your note.');
      return;
    }

    setEditLoading(true);

    try {
      const updatedAtIso = new Date().toISOString();
      const { data, error: updateError } = await supabase
        .from('notes')
        .update({
          title: trimmedTitle,
          content: trimmedContent,
          updated_at: updatedAtIso,
        })
        .eq('id', editingNoteId)
        .eq('user_id', userId)
        .select('id, user_id, title, content, created_at, updated_at');

      if (updateError) {
        // Preserves typed title & content edits upon failure
        setEditError(updateError.message);
      } else if (data && data.length > 0) {
        const updatedNote = data[0] as Note;
        setNotes((prevNotes) =>
          prevNotes.map((n) => (n.id === editingNoteId ? updatedNote : n))
        );
        setEditingNoteId(null);
        setEditTitle('');
        setEditContent('');
      } else {
        setEditError('Note update failed. The note was not found or permission was denied.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditError(err.message);
      } else {
        setEditError('An unexpected network error occurred while updating the note.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleStartDelete = (noteId: string) => {
    if (isAnyMutationActive) return;
    setDeletingNoteId(noteId);
    setDeleteError(null);
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
    }
  };

  const handleCancelDelete = () => {
    if (deleteLoadingId !== null) return;
    setDeletingNoteId(null);
    setDeleteError(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (deleteLoadingId !== null) return;

    setDeleteLoadingId(noteId);
    setDeleteError(null);

    try {
      const { data, error: deleteQueryError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId)
        .select('id');

      if (deleteQueryError) {
        setDeleteError(deleteQueryError.message);
      } else if (data && data.length > 0 && data[0].id === noteId) {
        setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
        setDeletingNoteId(null);
      } else {
        setDeleteError('Failed to delete note. The note was not found or access was denied.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('An unexpected network error occurred while deleting the note.');
      }
    } finally {
      setDeleteLoadingId(null);
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
          disabled={signOutLoading || isAnyMutationActive}
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
              disabled={isAnyMutationActive || loading}
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
            <button
              type="button"
              className="btn-retry"
              onClick={fetchNotes}
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Retry Loading Notes'}
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
                      <div className="note-card-actions">
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => handleStartEdit(note)}
                          title="Edit Note"
                          disabled={isAnyMutationActive}
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleStartDelete(note.id)}
                          title="Delete Note"
                          disabled={isAnyMutationActive}
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <p className="note-content">{note.content}</p>

                    {deletingNoteId === note.id && (
                      <div className="delete-confirm-box">
                        <p className="delete-confirm-text">
                          Are you sure you want to delete this note?
                        </p>

                        {deleteError && (
                          <div className="alert alert-error" role="alert" style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
                            <span>{deleteError}</span>
                          </div>
                        )}

                        <div className="delete-confirm-actions">
                          <button
                            type="button"
                            className="btn-cancel"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                            onClick={handleCancelDelete}
                            disabled={deleteLoadingId === note.id}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="btn-confirm-delete"
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deleteLoadingId === note.id}
                          >
                            {deleteLoadingId === note.id ? (
                              <span className="button-spinner-wrapper">
                                <span className="spinner"></span>
                                Deleting...
                              </span>
                            ) : (
                              'Confirm Delete'
                            )}
                          </button>
                        </div>
                      </div>
                    )}

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
