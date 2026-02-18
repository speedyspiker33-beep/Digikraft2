# Web Flow

User flows and navigation for DigiKraft.shop.

## Table of Contents

- [Customer Journey](#customer-journey)
- [Satellite Page Flow](#satellite-page-flow)
- [Admin Journey](#admin-journey)
- [Satellite Page Creation Flow](#satellite-page-creation-flow)
- [Adding Features Flow](#adding-features-flow)
- [Checkout Flow](#checkout-flow)
- [Error Flows](#error-flows)
- [Notification Flows](#notification-flows)

---

## Customer Journey

### Discovery Flow

```
Landing Page (Home)
  ↓
Browse Categories / Search
  ↓
Product Grid (Filters applied)
  ↓
Product Detail Page
  ├── Basic Mode: Simple card layout
  └── Landing Page Mode: Full sales page
  ↓
Add to Cart
  ↓
Cart Drawer / Cart Page
  ↓
Checkout (Unified, main site)
  ↓
Payment (PayPal/Razorpay/Stripe)
  ↓
Order Confirmation + Email
  ↓
Download Products (Account dashboard)
```

### Account Management

```
Login / Register
  ↓
Account Dashboard
  ├── Orders (history + downloads)
  ├── Profile Settings
  └── Payment Methods
```

---

## Satellite Page Flow

```
Main Site Navigation
  ↓
Click "CorelDRAW Hub"
  ↓
Satellite Page Loads (/coreldraw)
  ├── Inherits global header (customized)
  ├── Custom hero section
  ├── Page-specific sidebar filters
  ├── Products tagged to CorelDRAW
  └── Unified cart (same as main site)
  ↓
Add to cart on satellite page
  ↓
Checkout on main site (seamless)
  ↓
Return to satellite page after purchase
```

---

## Admin Journey

### Super Admin Flow

```
Login
  ↓
Dashboard (Global stats)
  ├── Quick actions: Add product, View orders, Check revenue
  ↓
Sidebar Navigation (Full access)
  ├── Products: Manage all products
  ├── Orders: All orders across all pages
  ├── Pages: Satellite hub manager ⭐
  │   ├── View all satellite pages as cards
  │   ├── Create new satellite page
  │   ├── Click "Manage" on any page
  │   │   └── Enter Sub-Admin Context
  │   │       ├── Dashboard (page-specific stats)
  │   │       ├── Products (page-filtered)
  │   │       ├── Layout (visual builder) ⭐
  │   │       ├── Content (pages, blog)
  │   │       ├── Users (page customers)
  │   │       └── Settings (page config)
  │   └── Return to Pages Hub
  ├── Users: All users, role management
  ├── Payments: Global gateway settings
  └── Settings: Site-wide configuration
```

### Sub-Admin Flow

```
Login (same portal)
  ↓
System detects: Sub-Admin role
  ↓
Redirect to assigned satellite page dashboard
  ↓
Sidebar (Filtered, contextual)
  ├── Dashboard (page stats only)
  ├── Products (page products only)
  ├── Layout (page builder)
  ├── Content (page content only)
  ├── Users (page customers only)
  └── Settings (page settings only)
  ↓
NO access to:
  ├── Other satellite pages
  ├── Payment gateways
  ├── Global settings
  └── User role management
```

---

## Satellite Page Creation Flow

```
Super Admin clicks "Register New Page"
  ↓
Modal: Enter page details
  ├── Name: "AI Workflow Lab"
  ├── Slug: "ai-lab"
  ├── Template: "Creative Hub"
  └── Assign Sub-Admin: [Select user]
  ↓
Engine executes:
  1. Create database record (pages table)
  2. Create folder: /pages/ai-lab/
  3. Copy template files to folder
  4. Create sub-admin role: ai_lab_admin
  5. Add to main navigation config
  6. Initialize empty product catalog
  7. Create webhook endpoints
  8. Send notification to assigned sub-admin
  ↓
Success: Page appears in Pages Hub
  ↓
Sub-admin receives email: "You've been assigned..."
  ↓
Sub-admin logs in → Sees AI Workflow Lab dashboard
```

---

## Adding Features Flow

**Example: Add CDR Converter to CorelDRAW Hub**

```
Developer creates: /pages/coreldraw/cdr-converter/
  ├── index.html (tool interface)
  ├── assets/ (tool-specific files)
  └── config.json (registration config)
  ↓
Config automatically registers with:
  ├── Navigation system (adds "CDR Converter" link)
  ├── Permissions (inherits page security)
  └── Analytics (tracks usage)
  ↓
Appears in CorelDRAW Hub navigation
  ↓
Sub-admin can:
  ├── See in Layout → Navigation settings
  ├── Toggle visibility
  ├── Reorder position
  └── Customize link text/icon
```

---

## Checkout Flow

**Unified Across All Pages**

```
Customer on any page (main or satellite)
  ↓
Add to cart (AJAX, no page reload)
  ↓
Cart updates in header (badge count)
  ↓
Click cart → Slide-out drawer or cart page
  ↓
Click checkout → Redirect to /checkout (main site)
  ↓
Checkout page shows:
  ├── All items from cart (regardless of source page)
  ├── Customer info form
  └── Payment method selection
  ↓
Payment processing
  ↓
Success → Order confirmation page
  ↓
Email sent with download links
  ↓
Customer dashboard shows unified order history
```

---

## Error Flows

### 404 Not Found

```
Custom 404 page
  ├── Search bar
  ├── Popular categories
  └── Link to homepage
```

### Payment Failed

```
Retry payment (same method)
  ↓
Or: Change payment method
  ↓
Or: Contact support (link)
```

### Unauthorized Access

```
Sub-admin tries global setting
  ↓
Show: "You don't have permission"
  ↓
Button: "Request Access" (sends to Super Admin)
  ↓
Or: Redirect to their dashboard
```

---

## Notification Flows

| Event | Recipient | Channel | Content |
|:------|:----------|:--------|:--------|
| New order | Customer | Email | Confirmation + download links |
| New order | Admin | Dashboard + Email | Order details, customer info |
| Low stock | Admin | Dashboard alert | Product name, current stock |
| New sub-admin | Sub-admin | Email | Login credentials, page access |
| Payment failed | Customer | Email | Retry link, support contact |
| Weekly summary | Super Admin | Email | Sales, top products, new users |

---

## Related Documents

- [System Architecture](System%20Architecture.md) - System connections
- [Backend Architecture](Backend%20Architecture.md) - Backend data flows
- [Frontend UI](Frontend%20UI.md) - UI specifications
- [Backend UI](Backend%20UI.md) - Admin UI components
