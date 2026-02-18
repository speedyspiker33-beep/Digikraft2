# System Architecture

Complete system architecture and connections map for DigiKraft.shop.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Connection 1: Main Website ↔ Satellite Pages](#connection-1-main-website--satellite-pages)
- [Connection 2: Super Admin ↔ Sub-Admin](#connection-2-super-admin--sub-admin)
- [Connection 3: Satellite Page ↔ Features](#connection-3-satellite-page--features)
- [Connection 4: Admin Panel ↔ Frontend](#connection-4-admin-panel--frontend)
- [Connection 5: Payment System ↔ All Pages](#connection-5-payment-system--all-pages)
- [Connection 6: Database ↔ Cache ↔ Filesystem](#connection-6-database--cache--filesystem)
- [Connection 7: AI Agents ↔ Core System](#connection-7-ai-agents--core-system)
- [Connection Summary](#connection-summary)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Main     │  │  CorelDRAW  │  │   AI Lab    │  │   Future    │    │
│  │   Website   │  │     Hub     │  │   (Sat)     │  │   Pages…    │    │
│  │  (Frontend) │  │  (Satellite)│  │  (Satellite)│  │  (Satellite)│    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │           │
│         └────────────────┴────────────────┴────────────────┘           │
│                                    │                                   │
│                                    ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    UNIFIED API GATEWAY                           │  │
│  │         (Authentication, Rate Limiting, Routing)                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┼──────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Auth     │  │   Product   │  │    Order    │  │    Page     │    │
│  │   Service   │  │   Service   │  │   Service   │  │   Engine    │    │
│  │  (JWT/OAuth)│  │ (CRUD/Tags) │  │(Cart/Checkout)│  │  (Satellite)│   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Payment   │  │    User     │  │    Email    │  │   Upload    │    │
│  │  Processor  │  │ Management  │  │   Service   │  │   Service   │    │
│  │(Multi-Gateway)│  │(Roles/Perms)│  │ (Templates) │  │ (S3/Local)  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐                                      │
│  │   Webhook   │  │  AI Agent   │  ← Future: Pluggable modules         │
│  │   Handler   │  │  Connector  │                                      │
│  └─────────────┘  └─────────────┘                                      │
└────────────────────────────────────┼──────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  PostgreSQL │  │    Redis    │  │  S3 Storage │  │    Email    │    │
│  │  (Primary)  │  │ (Cache/     │  │ (Files/     │  │  Provider   │    │
│  │             │  │  Session)   │  │   Assets)   │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Connection 1: Main Website ↔ Satellite Pages

### Relationship: Parent ↔ Children

| Aspect | Connection |
|--------|-----------|
| **Navigation** | Main header links to all satellite pages |
| **Styling** | Satellite inherits global CSS, can override |
| **Cart** | Unified cart object (shared across all) |
| **User Session** | Single login works everywhere |
| **Checkout** | All roads lead to main site checkout |

### Data Flow

```
User on Main Site
  ↓
Clicks "CorelDRAW Hub"
  ↓
Loads /coreldraw (separate HTML file)
  ↓
Same session cookie sent
  ↓
API recognizes user, returns page-specific data
  ↓
Cart items from main site still visible
  ↓
User adds CorelDRAW product
  ↓
Cart updates (same cart ID)
  ↓
Checkout redirects to /checkout (main site)
  ↓
Payment processed
  ↓
Order tagged with source_page: "coreldraw"
```

### Code Connection

```javascript
// Shared cart utility
// /shared/cart.js - Used by all pages

class UnifiedCart {
  constructor() {
    this.cartId = localStorage.getItem('cart_id') || generateUUID();
  }
    
  async addItem(productId, pageId) {
    await api.post('/cart/items', {
      cartId: this.cartId,
      productId,
      pageId  // Tags item with source page
    });
  }
    
  async getItems() {
    return api.get(`/cart/${this.cartId}`);
    // Returns items from ALL pages
  }
}
```

---

## Connection 2: Super Admin ↔ Sub-Admin

### Relationship: Global ↔ Scoped

| Super Admin Can | Sub-Admin Cannot |
|:----------------|:-----------------|
| See all pages | See other pages |
| Create/delete pages | Create pages |
| Manage payment gateways | Access payment settings |
| Assign sub-admins | Assign other sub-admins |
| View global analytics | View other pages' data |
| Manage all users | Manage global users |
| Configure site-wide settings | Change global settings |

### Permission Flow

```
User logs in
  ↓ POST /auth/login
  ↓ Returns: { user, role, assignedPageId?, token }
    
If role === 'SUPER_ADMIN':
  ↓ Sidebar shows: ALL menu items
  ↓ API requests: No page filter applied
  ↓ Can access: /admin/pages (create new)
    
If role === 'SUB_ADMIN':
  ↓ Sidebar shows: FILTERED menu items
      - Dashboard → page-specific stats
      - Products → filtered to assignedPageId
      - Users → customers of that page only
  ↓ API requests: Middleware auto-adds filter
      - GET /products → WHERE pageId = assignedPageId
  ↓ Cannot access: /admin/payments (403 Forbidden)
```

### Middleware Implementation

```javascript
// /api/middleware/authorize.js

const requirePageAccess = (req, res, next) => {
  const { role, assignedPageId } = req.user;
    
  if (role === 'SUPER_ADMIN') {
    return next(); // Full access
  }
    
  if (role === 'SUB_ADMIN') {
    // Force filter to their page
    req.pageFilter = { pageId: assignedPageId };
      
    // Check if trying to access other pages
    if (req.params.pageId && req.params.pageId !== assignedPageId) {
      return res.status(403).json({ error: 'Access denied to this page' });
    }
      
    return next();
  }
    
  res.status(403).json({ error: 'Insufficient permissions' });
};
```

---

## Connection 3: Satellite Page ↔ Features

### Relationship: Container ↔ Modules

```
/pages/coreldraw/                    ← Container (Satellite Page)
  ├── index.html                     ← Homepage
  ├── /macros                        ← Feature Module 1
  │     ├── index.html
  │     └── assets/
  ├── /plugins                       ← Feature Module 2
  │     ├── index.html
  │     └── assets/
  ├── /cdr-converter                 ← NEW: Drop in Feature Module 3
  │     ├── index.html               ← Tool interface
  │     ├── /assets                  ← Tool-specific files
  │     └── config.json              ← Registration config
  └── /assets                        ← Shared page assets
```

### Auto-Registration System

**config.json** (in each feature folder)

```json
{
  "name": "CDR Converter",
  "slug": "cdr-converter",
  "icon": "refresh-cw",
  "navPosition": 4,
  "permissions": ["read", "write"],
  "requiresAuth": false,
  "parentPage": "coreldraw"
}
```

**Registration Flow**

```
Feature folder dropped in /pages/coreldraw/
  ↓ Server scans on startup
  ↓ Reads config.json
  ↓ Validates: parentPage matches folder location
  ↓ Adds to navigation registry
  ↓ Creates route: /coreldraw/cdr-converter
  ↓ Applies permissions from config
  ↓ Available immediately (no restart if dynamic)
```

### Navigation Generation

```javascript
// Server-side: Build nav based on filesystem + config

function buildPageNavigation(pageSlug) {
  const pageDir = `./pages/${pageSlug}`;
  const features = fs.readdirSync(pageDir)
    .filter(dir => fs.existsSync(`${pageDir}/${dir}/config.json`))
    .map(dir => {
      const config = require(`${pageDir}/${dir}/config.json`);
      return {
        name: config.name,
        path: `/${pageSlug}/${config.slug}`,
        icon: config.icon,
        position: config.navPosition
      };
    })
    .sort((a, b) => a.position - b.position);
    
  return features;
}
```

---

## Connection 4: Admin Panel ↔ Frontend Customization

### Relationship: Configuration ↔ Rendering

```
Admin saves settings
  ↓ POST /api/settings/header
  ↓ Body: { logo, navItems, searchEnabled... }
  ↓ Saved to database: settings table
  ↓ Cache invalidated: settings:header
  ↓ If static site: Trigger rebuild
  ↓ If dynamic: Next request gets new config

Frontend requests page
  ↓ GET /api/settings/header
  ↓ Check cache: miss
  ↓ Query database
  ↓ Store in cache (1 hour TTL)
  ↓ Return JSON config

Frontend renders
  ↓ Receives config object
  ↓ Passes to Header component
  ↓ Component renders based on config
  ↓ Logo: config.logo.url
  ↓ Nav items: config.navItems.map(...)
  ↓ Search: config.searchEnabled ? <SearchBar /> : null
```

### Settings Schema

```javascript
// settings table structure

{
  key: "header_config",
  value: {
    logo: { type: "image", url: "/logo.png", width: 120 },
    announcement: { enabled: true, text: "Free shipping...", color: "#1E40AF" },
    navItems: [
      { name: "Home", url: "/", position: 1 },
      { name: "Products", url: "/shop", position: 2 },
      { name: "Hubs", url: "#", position: 3, children: [
        { name: "CorelDRAW", url: "/coreldraw" },
        { name: "AI Lab", url: "/ai-lab" }
      ]}
    ],
    search: { enabled: true, position: "center", placeholder: "Search..." },
    rightZone: ["wishlist", "cart", "user"]
  },
  updatedAt: "2024-01-15T10:30:00Z",
  updatedBy: "user_id_123"
}
```

---

## Connection 5: Payment System ↔ All Pages

### Relationship: Centralized Service

```
CorelDRAW Hub          AI Workflow Lab        Main Shop
     │                       │                    │
     └───────────────────────┼────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │  UNIFIED CART   │
                    │  (Same cart_id) │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │  CHECKOUT PAGE  │
                    │  (Main site only)│
                    └────────┬────────┘
                             ▼
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │  Stripe │    │Razorpay │    │  PayPal │
        │ (Cards) │    │ (UPI)   │    │(Express)│
        └────┬────┘    └────┬────┘    └────┬────┘
             └──────────────┼──────────────┘
                            ▼
                    ┌─────────────────┐
                    │  WEBHOOK HANDLER │
                    │  (Order update)  │
                    └─────────────────┘
```

### Payment Flow Detail

1. Customer adds products from ANY page to cart
2. Cart stores: [{productId, pageId, quantity, price}]
3. Customer clicks checkout → Redirects to /checkout
4. Checkout page displays unified cart with page badges
   - "CorelDRAW Hub" badge on CDR products
   - "AI Lab" badge on workflow products
5. Customer selects payment method
6. Payment processed via chosen gateway
7. Webhook confirms payment
8. Order created with items tagged by pageId
9. Revenue attributed to correct page for analytics

### Order Item Schema

```javascript
{
  orderId: "ord_123",
  items: [
    {
      productId: "prod_456",
      pageId: "coreldraw",      // ← Source page tagged
      pageName: "CorelDRAW Hub", // ← Denormalized for display
      title: "Macro Pack Pro",
      price: 29.00,
      quantity: 1
    },
    {
      productId: "prod_789",
      pageId: "ai-lab",
      pageName: "AI Workflow Lab",
      title: "n8n Automation Bundle",
      price: 49.00,
      quantity: 1
    }
  ],
  total: 78.00,
  currency: "USD"
}
```

---

## Connection 6: Database ↔ Cache ↔ Filesystem

### Three-Layer Data Strategy

| Layer | Purpose | Examples |
|:------|:--------|:---------|
| **PostgreSQL** | Source of truth | Users, orders, products, settings |
| **Redis** | Speed layer | Sessions, cart, product lists, settings |
| **Filesystem** | Templates & assets | Page templates, uploaded files, logs |

### Sync Strategy

**Write Path:**
```
Frontend → API → Database → Invalidate Cache → Return success
```

**Read Path:**
```
Frontend → API → Check Cache → Hit? Return : Query DB → Store in cache → Return
```

**File Generation:**
```
Admin saves layout config → API → DB → Trigger static build → Files written to /pages/
OR
Admin saves → API → DB → Next request renders dynamically with config
```

### Cache Invalidation Rules

**Product updated:**
```
→ DEL cache:product:{slug}
→ DEL cache:products:list:*
→ DEL cache:page:{pageId}:products
```

**Page settings updated:**
```
→ DEL cache:settings:page:{pageId}
→ DEL cache:page:{slug}:config
→ Trigger rebuild (if static)
```

**Order created:**
```
→ DEL cache:dashboard:stats
→ DEL cache:user:{id}:orders
```

---

## Connection 7: AI Agents ↔ Core System

### Extension Points (Pre-built)

| System Component | AI Hook Point | Future Agent |
|:----------------|:--------------|:-------------|
| Product creation form | "AI Assist" tab | Product Genesis Agent |
| Dashboard insights panel | "AI Recommendations" box | Trend Hunter Agent |
| Marketing menu | "Auto-Campaigns" section | Marketing Synthesizer |
| Order completion webhook | Post-purchase trigger | Customer Success Agent |
| Daily cron job | 9 AM execution | Daily Report Agent |

### Agent Integration Pattern

**Current:** Placeholder UI, no backend

**Future:** Agent installed as module
```
  ↓ Registers with Agent Manager
  ↓ Defines triggers: ["product.created", "schedule.daily"]
  ↓ Defines autonomy: "suggest" | "review" | "auto"
  ↓ Receives events via message queue (Redis/Bull)
  ↓ Processes with OpenAI/Local LLM
  ↓ Returns suggestion OR auto-executes
  ↓ Logs action to agent_logs table
  ↓ Notifies admin if review required
```

### Agent Manager Schema

```javascript
// Future implementation

{
  agentId: "product-genesis-v1",
  name: "Product Genesis",
  status: "active", // active, paused, disabled
  autonomy: "review", // suggest, review, auto
  triggers: ["product.files_uploaded"],
  config: {
    openaiModel: "gpt-4",
    maxTokens: 1000,
    temperature: 0.7
  },
  permissions: ["read:products", "write:products", "read:categories"],
  allowedPages: ["*"], // or ["coreldraw", "ai-lab"]
  createdAt: "2024-06-01"
}
```

---

## Connection Summary

| Connection | Type | Protocol/Data Format |
|:-----------|:-----|:---------------------|
| Main ↔ Satellite | Shared session, unified cart | HTTP + Cookies + LocalStorage |
| Super Admin ↔ Sub-Admin | Role-based access control | JWT claims + Middleware filters |
| Page ↔ Features | Filesystem auto-discovery | config.json + Convention |
| Admin ↔ Frontend | Configuration API | REST JSON + Cache (Redis) |
| All Pages ↔ Payments | Centralized checkout | Unified cart → Single checkout |
| DB ↔ Cache ↔ Files | Layered data strategy | Prisma + Redis + Node fs |
| Core ↔ Future AI | Message queue + Webhooks | Bull queue + Event emitters |

---

## Related Documents

- [Backend Architecture](Backend%20Architecture.md) - Backend data flows and API
- [Tech Stack](Tech%20Stack.md) - Technology choices
- [Folder Structure](Folder%20Structure.md) - Project organization
