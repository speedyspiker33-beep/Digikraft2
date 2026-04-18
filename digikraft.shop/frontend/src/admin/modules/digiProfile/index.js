/**
 * DIGIPROFILE MODULE
 * KYC Management, User Services, Detailed User Analytics
 */

// Main view - User listing with KYC status
const mainView = {
  name: 'digiprofile',
  label: 'DigiProfile Users',
  routes: [
    {
      path: '/',
      name: 'digiprofile-users',
      render: async () => {
        const users = JSON.parse(localStorage.getItem('dp_users') || '[]');
        const totalRevenue = users.reduce((sum, u) => sum + (u.totalSales || 0), 0);
        const totalOrders = users.reduce((sum, u) => sum + (u.totalOrders || 0), 0);
        
        return `
<div class="digiprofile-view">
  <div class="ph">
    <div>
      <div class="ph-title">DigiProfile Management</div>
      <div class="ph-sub">KYC verified users & service subscribers</div>
    </div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="openAddUserModal()">
        <i class="fas fa-plus"></i> Add User
      </button>
      <button class="btn btn-secondary" onclick="exportDigiProfileCSV()">
        <i class="fas fa-download"></i> Export
      </button>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom: 24px">
    <div class="stat-card">
      <div class="si si-purple"><i class="fas fa-users"></i></div>
      <div class="stat-content">
        <div class="sv">${users.length}</div>
        <div class="sl">Total Users</div>
        <div class="sc">${users.filter(u => u.kycStatus === 'verified').length} verified</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="si si-green"><i class="fas fa-rupee-sign"></i></div>
      <div class="stat-content">
        <div class="sv">₹${totalRevenue.toLocaleString('en-IN')}</div>
        <div class="sl">Total Revenue</div>
        <div class="sc">${users.filter(u => u.subscriptionStatus === 'active').length} active subs</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="si si-blue"><i class="fas fa-shopping-bag"></i></div>
      <div class="stat-content">
        <div class="sv">${totalOrders}</div>
        <div class="sl">Total Orders</div>
        <div class="sc">${users.filter(u => u.runningAds > 0).length} running ads</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="si si-yellow"><i class="fas fa-ad"></i></div>
      <div class="stat-content">
        <div class="sv">${users.reduce((sum, u) => sum + (u.runningAds || 0), 0)}</div>
        <div class="sl">Active Ads</div>
        <div class="sc">Across all users</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="ttb">
      <div class="ts" style="flex: 0 0 200px">
        <select class="fc" id="kyc-filter" onchange="filterDigiProfile()" style="width: 100%">
          <option value="">All KYC Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div class="ts" style="flex: 0 0 200px">
        <select class="fc" id="sub-filter" onchange="filterDigiProfile()" style="width: 100%">
          <option value="">All Subscriptions</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="trial">Trial</option>
        </select>
      </div>
      <div class="ts" style="flex: 1">
        <i class="fas fa-search"></i>
        <input type="text" id="search-users" placeholder="Search users..." oninput="filterDigiProfile()">
      </div>
    </div>

    <div class="tw">
      <table class="table" id="digiprofile-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email/Phone</th>
            <th>KYC Status</th>
            <th>Subscription</th>
            <th>Products</th>
            <th>Pages</th>
            <th>Running Ads</th>
            <th>Sales</th>
            <th>Orders</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="digiprofile-tbody">
          ${users.length ? users.map(user => `
            <tr onclick="viewUserDetails('${user.id}')" style="cursor: pointer">
              <td>
                <div class="pi">
                  <strong>${user.name}</strong>
                  <span>@${user.username}</span>
                </div>
              </td>
              <td>
                <div class="pi">
                  <strong>${user.email}</strong>
                  <span>${user.phone || '-'}</span>
                </div>
              </td>
              <td><span class="tag ${user.kycStatus === 'verified' ? 'tg' : user.kycStatus === 'pending' ? 'ty' : 'tr'}">${user.kycStatus || 'pending'}</span></td>
              <td><span class="tag ${user.subscriptionStatus === 'active' ? 'tg' : 'tr'}">${user.subscriptionStatus || 'none'}</span></td>
              <td><strong>${user.productCount || 0}</strong> products</td>
              <td><strong>${user.pageCount || 0}</strong> pages</td>
              <td><strong>${user.runningAds || 0}</strong> ads</td>
              <td><strong class="sv">₹${(user.totalSales || 0).toLocaleString('en-IN')}</strong></td>
              <td><strong>${user.totalOrders || 0}</strong> orders</td>
              <td><span class="sl">${new Date(user.joinedDate || Date.now()).toLocaleDateString('en-IN')}</span></td>
              <td>
                <div style="display: flex; gap: 5px">
                  <button class="btn btn-primary btn-sm btn-icon" onclick="event.stopPropagation(); viewUserDetails('${user.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-secondary btn-sm btn-icon" onclick="event.stopPropagation(); editUser('${user.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-danger btn-sm btn-icon" onclick="event.stopPropagation(); deleteUser('${user.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="11" class="empty-state">
                <i class="fas fa-users"></i>
                <p>No DigiProfile users found</p>
                <button class="btn btn-primary" onclick="openAddUserModal()">Add First User</button>
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ADD/EDIT USER MODAL -->
<div class="mo" id="user-modal">
  <div class="md" style="max-width: 800px; max-height: 90vh">
    <div class="mh">
      <div class="mt" id="user-modal-title">Add DigiProfile User</div>
      <button class="mc" onclick="closeModal('user-modal')"><i class="fas fa-times"></i></button>
    </div>
    <div class="mb" style="max-height: calc(90vh - 160px); overflow-y: auto">
      <form id="user-form" onsubmit="saveUser(event)">
        <input type="hidden" name="id" id="user-id">
        <input type="hidden" name="joinedDate" id="user-joined-date">
        
        <div class="tabs" style="margin-bottom: 20px">
          <button class="tab on" type="button" onclick="userTab('basic', this)">Basic Info</button>
          <button class="tab" type="button" onclick="userTab('kyc', this)">KYC & Services</button>
          <button class="tab" type="button" onclick="userTab('stats', this)">Statistics</button>
          <button class="tab" type="button" onclick="userTab('subscription', this)">Subscription</button>
        </div>
        
        <div id="user-tab-basic">
          <div class="fgrid">
            <div class="fg"><label class="fl">Full Name *</label><input class="fc" name="name" required></div>
            <div class="fg"><label class="fl">Username *</label><input class="fc" name="username" required></div>
            <div class="fg"><label class="fl">Email *</label><input class="fc" name="email" type="email" required></div>
            <div class="fg"><label class="fl">Phone</label><input class="fc" name="phone"></div>
            <div class="fg"><label class="fl">Instagram Handle</label><input class="fc" name="instagram" placeholder="@username"></div>
            <div class="fg"><label class="fl">Business Name</label><input class="fc" name="businessName" placeholder="Optional"></div>
          </div>
        </div>
        
        <div id="user-tab-kyc" style="display: none">
          <div class="fgrid">
            <div class="fg"><label class="fl">KYC Status</label>
              <select class="fc" name="kycStatus">
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div class="fg"><label class="fl">KYC Document ID</label><input class="fc" name="kycDocumentId" placeholder="Aadhar, PAN, etc."></div>
            <div class="fg"><label class="fl">Services Access</label>
              <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px; background: var(--bg3); border-radius: 9px">
                <label style="display: flex; align-items: center; gap: 8px">
                  <input type="checkbox" name="services" value="ads" style="width: 16px; height: 16px"> 
                  <span>Ad Manager</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px">
                  <input type="checkbox" name="services" value="store" style="width: 16px; height: 16px"> 
                  <span>Online Store</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px">
                  <input type="checkbox" name="services" value="pages" style="width: 16px; height: 16px"> 
                  <span>Landing Pages</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px">
                  <input type="checkbox" name="services" value="payments" style="width: 16px; height: 16px"> 
                  <span>Payment Links</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div id="user-tab-stats" style="display: none">
          <div class="fgrid">
            <div class="fg"><label class="fl">Product Count</label><input class="fc" name="productCount" type="number" min="0" value="0"></div>
            <div class="fg"><label class="fl">Page Count</label><input class="fc" name="pageCount" type="number" min="0" value="0"></div>
            <div class="fg"><label class="fl">Running Ads</label><input class="fc" name="runningAds" type="number" min="0" value="0"></div>
            <div class="fg"><label class="fl">Total Sales (₹)</label><input class="fc" name="totalSales" type="number" min="0" value="0" step="0.01"></div>
            <div class="fg"><label class="fl">Total Orders</label><input class="fc" name="totalOrders" type="number" min="0" value="0"></div>
            <div class="fg"><label class="fl">Store Status</label>
              <select class="fc" name="storeStatus">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
        
        <div id="user-tab-subscription" style="display: none">
          <div class="fgrid">
            <div class="fg"><label class="fl">Subscription Plan</label>
              <select class="fc" name="subscriptionPlan">
                <option value="">None</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div class="fg"><label class="fl">Subscription Status</label>
              <select class="fc" name="subscriptionStatus">
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="fg"><label class="fl">Subscription Start</label><input class="fc" name="subscriptionStart" type="date"></div>
            <div class="fg"><label class="fl">Subscription End</label><input class="fc" name="subscriptionEnd" type="date"></div>
            <div class="fg"><label class="fl">Auto Renewal</label>
              <label class="tgl">
                <input type="checkbox" name="autoRenewal">
                <span class="tgs"></span>
              </label>
            </div>
            <div class="fg"><label class="fl">Payment Method</label>
              <select class="fc" name="paymentMethod">
                <option value="">None</option>
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="mf">
      <button class="btn btn-secondary" onclick="closeModal('user-modal')">Cancel</button>
      <button class="btn btn-primary" onclick="document.getElementById('user-form').requestSubmit()">
        <i class="fas fa-save"></i> Save User
      </button>
    </div>
  </div>
</div>

<!-- USER DETAIL VIEW MODAL -->
<div class="mo" id="user-detail-modal">
  <div class="md" style="max-width: 900px; max-height: 95vh">
    <div class="mh">
      <div class="mt" id="user-detail-title">User Details</div>
      <button class="mc" onclick="closeModal('user-detail-modal')"><i class="fas fa-times"></i></button>
    </div>
    <div class="mb" id="user-detail-content" style="max-height: calc(95vh - 160px); overflow-y: auto">
      <!-- Content dynamically loaded -->
    </div>
    <div class="mf">
      <button class="btn btn-secondary" onclick="closeModal('user-detail-modal')">Close</button>
    </div>
  </div>
</div>
        `;
      }
    }
  ]
};

export const routes = [
  ...mainView.routes
];

export default {
  name: 'digiProfile',
  label: 'DigiProfile',
  icon: 'fa-id-card',
  routes,
  init: async () => {
    console.log('🪪 DigiProfile module initialized');
    
    // Initialize with sample data if empty
    if (!localStorage.getItem('dp_users')) {
      const sampleUsers = [
        {
          id: '1',
          name: 'Rahul Sharma',
          username: 'rahul_s',
          email: 'rahul@example.com',
          phone: '+91 98765 43210',
          instagram: '@rahul_business',
          businessName: 'Sharma Digital Solutions',
          kycStatus: 'verified',
          kycDocumentId: 'AADP123456',
          joinedDate: new Date('2024-01-15').toISOString(),
          subscriptionPlan: 'pro',
          subscriptionStatus: 'active',
          subscriptionStart: '2024-01-15',
          subscriptionEnd: '2024-12-31',
          autoRenewal: true,
          paymentMethod: 'razorpay',
          services: ['ads', 'store', 'pages', 'payments'],
          productCount: 25,
          pageCount: 8,
          runningAds: 12,
          totalSales: 125000,
          totalOrders: 89,
          storeStatus: 'active'
        },
        {
          id: '2',
          name: 'Priya Patel',
          username: 'priya_p',
          email: 'priya@example.com',
          phone: '+91 98765 43211',
          instagram: '@priya_designs',
          businessName: 'Priya Creative Studio',
          kycStatus: 'pending',
          joinedDate: new Date('2024-02-20').toISOString(),
          subscriptionPlan: 'starter',
          subscriptionStatus: 'trial',
          subscriptionStart: '2024-02-20',
          subscriptionEnd: '2024-03-20',
          autoRenewal: false,
          paymentMethod: '',
          services: ['pages', 'payments'],
          productCount: 8,
          pageCount: 3,
          runningAds: 2,
          totalSales: 15000,
          totalOrders: 12,
          storeStatus: 'active'
        }
      ];
      localStorage.setItem('dp_users', JSON.stringify(sampleUsers));
    }
  }
};
