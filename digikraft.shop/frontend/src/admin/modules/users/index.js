/**
 * USERS MODULE
 * Customer & user management
 */

export const routes = [
  {
    path: '/',
    name: 'users',
    render: async () => {
      return `
        <div class="users-view">
          <h1>Users & Customers</h1>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-users"></i></div>
              <div class="stat-content">
                <div class="stat-value">0</div>
                <div class="stat-label">Total Users</div>
              </div>
            </div>
          </div>
          <div class="card">
            <h3>Recent Users</h3>
            <div class="empty-state">
              <i class="fas fa-user"></i>
              <p>No users yet</p>
            </div>
          </div>
        </div>
      `;
    }
  }
];

export default {
  name: 'users',
  label: 'Users',
  icon: 'fa-users',
  routes
};
