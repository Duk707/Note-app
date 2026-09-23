export function App() {
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
          <span>Step 2 - Frontend Setup Complete</span>
        </div>
      </div>

      <p className="app-description">
        Welcome to <strong>Notes App</strong>. The initial React + Vite + TypeScript frontend template has been configured successfully.
      </p>

      <div className="info-cards">
        <div className="info-card">
          <h2 className="info-card-title">Authentication</h2>
          <p className="info-card-desc">
            User registration, login, and session persistence using Supabase Auth will be added in upcoming steps.
          </p>
        </div>

        <div className="info-card">
          <h2 className="info-card-title">Notes Management</h2>
          <p className="info-card-desc">
            Personal notes creation, editing, viewing, and deletion with Row Level Security (RLS) will be implemented later.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
