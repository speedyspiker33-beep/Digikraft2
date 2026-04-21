# 🪪 DigiProfile - KYC & User Management System

## Overview

DigiProfile is a comprehensive user management module for the admin panel that tracks KYC applications, service subscriptions, and provides detailed user analytics including products, pages, ads, sales, and orders.

## ✅ Implementation Status

**Status**: ✅ **COMPLETE** - Fully implemented with working UI and data management

## 📁 Files Created

### 1. Module File
```
digikraft.shop/frontend/src/admin/modules/digiProfile/index.js
```
- Main module definition with routes
- Complete UI implementation
- Sample data initialization
- 4-tab form interface (Basic, KYC, Stats, Subscription)

### 2. Documentation
```
digikraft.shop/DIGIPROFILE.md (this file)
```
- Feature documentation and usage guide

## 🎯 Features Implemented

### 1. User Dashboard
- **Stats Cards**:
  - Total Users (with verified count)
  - Total Revenue (₹)
  - Total Orders (with running ads)
  - Active Ads (across all users)

### 2. User Management Table
**Columns Displayed**:
- User (Name + Username + Instagram)
- Email/Phone
- KYC Status (Pending/Verified/Rejected)
- Subscription Status (Trial/Active/Expired)
- Products (count)
- Pages (count)
- Running Ads (count)
- Sales (₹ formatted)
- Orders (count)
- Joined Date
- Actions (View/Edit/Delete)

### 3. Filter & Search
- **KYC Status Filter**: All/Pending/Verified/Rejected
- **Subscription Filter**: All/Active/Expired/Trial
- **Global Search**: Search across name, email, phone, username

### 4. User Detail View (Click Username)
Displays comprehensive user information:
- **Basic Information**: Name, username, email, phone, Instagram, business name
- **KYC Details**: Status, document ID, applied services
- **Statistics**: Product count, pages, running ads, total sales, total orders
- **Subscription**: Plan, status, dates, auto-renewal, payment method

### 5. Add/Edit User Modal
**4 Tabbed Sections**:
1. **Basic Info**: Name, username, email, phone, Instagram, business name
2. **KYC & Services**: KYC status, document ID, service access checkboxes
3. **Statistics**: Product/page counts, running ads, total sales/orders, store status
4. **Subscription**: Plan, status, dates, auto-renewal toggle, payment method

### 6. Actions
- **View Details**: Click username or eye icon
- **Edit User**: Edit all fields via modal
- **Delete User**: Remove from system
- **Export CSV**: Export all user data

## 💾 Data Structure

### User Object
```javascript
{
  id: "unique-id",
  name: "Full Name",
  username: "username",
  email: "user@email.com",
  phone: "+91 98765 43210",
  instagram: "@handle",
  businessName: "Business Name",
  
  // KYC Details
  kycStatus: "verified|pending|rejected",
  kycDocumentId: "AADP123456",
  services: ["ads", "store", "pages", "payments"],
  
  // Statistics
  productCount: 25,
  pageCount: 8,
  runningAds: 12,
  totalSales: 125000,
  totalOrders: 89,
  storeStatus: "active|paused|suspended",
  
  // Subscription
  subscriptionPlan: "starter|pro|enterprise",
  subscriptionStatus: "trial|active|expired|cancelled",
  subscriptionStart: "2024-01-15",
  subscriptionEnd: "2024-12-31",
  autoRenewal: true,
  paymentMethod: "razorpay|stripe|paypal",
  
  // Metadata
  joinedDate: "2024-01-15T00:00:00.000Z"
}
```

**Storage**: `localStorage` under key `dp_users`

## 🎨 UI Components Used

### CSS Classes (already available in admin)
- `.digiprofile-view` - Main container
- `.stats-grid` - Statistics cards layout
- `.stat-card` - Individual stat card
- `.card` - Content cards
- `.table` - Data table
- `.tabs` - Tabbed interface
- `.tab` - Tab buttons
- `.fgrid` - 2-column form grid
- `.fg` - Form group
- `.fc` - Form controls
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger` - Buttons
- `.tag`, `.tg`, `.ty`, `.tr` - Status tags (green/yellow/red)
- `.modal` - Modal overlay
- `.mo`, `.md`, `.mh`, `.mb`, `.mf` - Modal sections
- `.sl` - Small text muted
- `.sv` - Stat value
- `.empty-state` - Empty table state

## 🔧 API Functions

### User Management
- `viewUserDetails(userId)` - Opens user detail modal
- `editUser(userId)` - Opens edit modal
- `deleteUser(userId)` - Deletes user with confirmation
- `saveUser(event)` - Handles form submission
- `openAddUserModal()` - Opens add user modal
- `exportDigiProfileCSV()` - Exports all users to CSV

### Tab Management
- `userTab(tabName, button)` - Switches between Basic/KYC/Stats/Subscription tabs

### Data Filtering
- `filterDigiProfile()` - Filters users by KYC status, subscription, and search
- Updates table in real-time

### Subscription Handling
- Subscription plans: Starter, Pro, Enterprise
- Statuses: Trial, Active, Expired, Cancelled
- Auto-renewal toggle
- Payment method tracking

## 📊 Sample Data Included

Two sample users automatically added on first load:

### 1. Rahul Sharma (Verified Pro User)
- **Products**: 25 | **Pages**: 8 | **Running Ads**: 12
- **Sales**: ₹125,000 | **Orders**: 89
- **KYC**: Verified (AADP123456)
- **Sub**: Pro plan, active until Dec 31

### 2. Priya Patel (Trial User)
- **Products**: 8 | **Pages**: 3 | **Running Ads**: 2
- **Sales**: ₹15,000 | **Orders**: 12
- **KYC**: Pending
- **Sub**: Trial until Mar 20

## 🚀 How to Use

### 1. Enable DigiProfile
Make sure it's enabled in `config.js`:
```javascript
digiProfile: { enabled: true, label: 'DigiProfile', icon: 'fa-id-card' }
```

### 2. Access the Module
1. Log into admin panel: http://localhost:3000
2. Click "DigiProfile" in sidebar
3. View all users immediately

### 3. View User Details
- **Click any username** in the table
- Opens comprehensive detail modal
- Shows all data: KYC, stats, subscription, services

### 4. Add New User
- Click "Add User" button
- Fill 4-tab form
- Save to add to system

### 5. Filter Users
- Use dropdowns for KYC/Subscription status
- Type in search box for global search
- Results update instantly

### 6. Export Data
- Click "Export" button
- Downloads all users as CSV
- Format: Name, Email, Statuses, Stats, etc.

## 🔮 Future Enhancements

### High Priority
1. **Backend Integration**
   - Move from localStorage to Strapi API
   - Add database models for users
   - Create REST endpoints

2. **KYC Document Upload**
   - File upload for KYC documents
   - Document verification workflow
   - Admin approval system

3. **Payment History**
   - Track all transactions per user
   - Link to Razorpay dashboard
   - Automatic subscription status updates

### Medium Priority
4. **User Activity Timeline**
   - Track last login
   - Activity feed (products added, pages created)
   - Session management

5. **Bulk Actions**
   - Select multiple users
   - Bulk edit KYC status
   - Bulk subscription changes

6. **Advanced Analytics**
   - Revenue charts per user
   - Growth metrics
   - Earnings reports

### Low Priority
7. **User Impersonation**
   - Login as user feature
   - Debug user accounts
   - Support troubleshooting

8. **Notifications**
   - Email users about KYC status changes
   - Subscription expiry reminders
   - Admin alerts for new users

9. **Roles & Permissions**
   - Different user roles
   - Tiered access levels
   - Permission management

## 🔒 Security Considerations

⚠️ **Current**: Data stored in localStorage (browser-only)
- Not persistent across browsers
- No server-side validation
- No user authentication

✅ **Recommended**: Migrate to Strapi backend
- Create User collection type
- Add API endpoints
- Implement JWT authentication
- Add role-based access

## 📞 Support

For issues or feature requests with DigiProfile:
1. Check this documentation
2. Review `digikraft.shop/frontend/src/admin/modules/digiProfile/index.js`
3. Check browser console for errors
4. Verify localStorage has `dp_users` key

## 🎉 Summary

DigiProfile is **fully implemented** and ready to use! It provides comprehensive user management including KYC tracking, subscription management, detailed analytics, and a beautiful UI consistent with the admin panel design system.

**Status**: ✅ **Production Ready** (with localStorage caveat)

---

**Created**: 2024-04-06
**Version**: 1.0.0
**Module**: `digiProfile`
**Location**: `digikraft.shop/frontend/src/admin/modules/digiProfile/`
