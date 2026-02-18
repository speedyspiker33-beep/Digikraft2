# Backend UI Components

UI specifications and component library for the admin panel.

## Table of Contents

- [Design Tokens](#design-tokens)
- [Component Library](#component-library)
- [Page Layouts](#page-layouts)
- [Admin Screens](#admin-screens)
- [Responsive Design](#responsive-design)

---

## Design Tokens

### Colors

```css
--color-primary: #2563EB;
--color-primary-hover: #1D4ED8;
--color-primary-light: #EFF6FF;
--color-background: #FFFFFF;
--color-surface: #F9FAFB;
--color-border: #E5E7EB;
--color-text-primary: #111827;
--color-text-secondary: #6B7280;
--color-text-muted: #9CA3AF;
--color-success: #10B981;
--color-warning: #F59E0B;
--color-danger: #EF4444;
```

### Typography

```css
--font-family: 'Inter', sans-serif;
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-2xl: 32px;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-8: 48px;
--space-10: 64px;
```

---

## Component Library

### Button

```html
<!-- Primary -->
<button class="btn btn-primary">Label</button>

<!-- Secondary/Outline -->
<button class="btn btn-secondary">Label</button>

<!-- Danger -->
<button class="btn btn-danger">Label</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
```

**CSS:**
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}
```

### Card

```html
<div class="card">
  <div class="card-header">Title</div>
  <div class="card-body">Content</div>
  <div class="card-footer">Actions</div>
</div>
```

**CSS:**
```css
.card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  transition: all 0.2s;
}
```

### Data Table

```html
<table class="table">
  <thead>
    <tr>
      <th>Order ID</th>
      <th>Customer</th>
      <th>Amount</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>#1234</td>
      <td>John Doe</td>
      <td>$49.00</td>
      <td><span class="badge badge-success">Paid</span></td>
    </tr>
  </tbody>
</table>
```

**CSS:**
```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.table td {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.table tbody tr:hover {
  background: var(--color-surface);
}
```

### Form Elements

```html
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="form-input" placeholder="name@example.com">
  <span class="form-error">Invalid email</span>
</div>
```

**CSS:**
```css
.form-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
```

### Badge

```html
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-danger">Inactive</span>
<span class="badge badge-info">New</span>
```

**CSS:**
```css
.badge {
  display: inline-flex;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 9999px;
}

.badge-success {
  background: #D1FAE5;
  color: #065F46;
}

.badge-warning {
  background: #FEF3C7;
  color: #92400E;
}

.badge-danger {
  background: #FEE2E2;
  color: #991B1B;
}
```

---

## Page Layouts

### Admin Layout

```html
<div class="admin-layout">
  <aside class="sidebar">...</aside>
  <div class="main-wrapper">
    <header class="top-header">...</header>
    <main class="content">...</main>
  </div>
</div>
```

**CSS:**
```css
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid var(--color-border);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.main-wrapper {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
}

.top-header {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.content {
  flex: 1;
  padding: 32px;
  background: var(--color-surface);
}
```

---

## Admin Screens

### Dashboard

**Components:**
- Stats cards (revenue, orders, users)
- Recent activity feed
- Quick action buttons
- Charts (revenue over time, top products)

### Products List

**Components:**
- Search bar
- Filter dropdowns (category, status, page)
- Data table with sortable columns
- Bulk action toolbar
- Pagination

### Product Edit

**Components:**
- Form sections (basic info, pricing, files)
- Image gallery with drag-drop upload
- Rich text editor (description)
- Category selector (multi-select)
- Page assignment (dropdown)

### Orders

**Components:**
- Status filter tabs (All, Pending, Paid, Shipped)
- Order table with expandable rows
- Order detail modal
- Status update dropdown
- Export to CSV button

### Users

**Components:**
- User table with avatar, name, email, role
- Role assignment dropdown
- Search by name/email
- Pagination

### Satellite Pages Hub

**Components:**
- Page cards grid
- "Create New Page" button
- Page stats (products, orders, revenue)
- Manage/Edit actions

### Sub-Admin Panel

**Components:**
- Page-specific dashboard
- Filtered product list
- Visual layout builder
- Page settings form

---

## Responsive Design

### Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }

/* Sidebar collapses on tablet */
@media (max-width: 1023px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .main-wrapper {
    margin-left: 0;
  }
}
```

---

## Icon System

Use **Lucide Icons** or **Heroicons** (24px default, 20px small)

| Icon | Name | Usage |
|:-----|:-----|:------|
| 📊 | bar-chart-2 | Dashboard |
| 📦 | package | Products |
| 👥 | users | Users |
| 🛒 | shopping-cart | Orders |
| 🌐 | layout | Pages |
| 📁 | folder | Categories |
| 🎨 | palette | Appearance |
| 💳 | credit-card | Payments |
| ⚙️ | settings | Settings |
| 📧 | mail | Email |
| 📈 | trending-up | Analytics |
| 🔌 | plug | Integrations |
| 🤖 | cpu | AI Agents |
| 🔒 | shield | Security |

---

## Related Documents

- [Frontend UI](Frontend%20UI.md) - Customer-facing UI specifications
- [System Architecture](System%20Architecture.md) - System connections
- [Folder Structure](Folder%20Structure.md) - Component organization
