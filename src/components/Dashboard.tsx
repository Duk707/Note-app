interface DashboardProps {
  userEmail: string;
  onSignOut: () => void;
  signOutLoading: boolean;
}

export function Dashboard({ userEmail, onSignOut, signOutLoading }: DashboardProps) {
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
        <h2 className="dashboard-title">Notes Dashboard</h2>
        <p className="dashboard-description">
          Welcome to your personal protected workspace. This dashboard structure is ready for notes management in upcoming steps.
        </p>

        <div className="dashboard-structure-card">
          <div className="structure-card-header">
            <h3 className="structure-card-title">Protected Workspace Ready</h3>
          </div>
          <p className="structure-card-desc">
            Your session is securely authenticated with Supabase Row Level Security (RLS). Personal notes reading and CRUD features will be integrated in subsequent build steps.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
