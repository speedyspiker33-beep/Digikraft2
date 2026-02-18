# DigiKraft.shop - Modular Folder Structure

## Core Principle

> Add new features by adding folders. Never modify core code for extensions.

---

## Root Level

```
digikraft-shop/
├── 📁 frontend/          # Customer-facing website
├── 📁 admin/             # Admin panel (separate build)
├── 📁 api/               # Backend API server
├── 📁 pages/             # SATELLITE PAGES (auto-generated)
├── 📁 modules/           # SHARED COMPONENTS (reusable)
├── 📁 shared/            # SHARED RESOURCES (db, config, utils)
├── 📁 config/            # CONFIGURATION FILES
├── 📁 docs/              # DOCUMENTATION
├── 📄 package.json       # Root dependencies
├── 📄 docker-compose.yml # Local development stack
└── 📄 README.md          # Project overview
```

---

## Frontend Folder

```
frontend/
├── 📁 src/
│   ├── 📁 components/        # UI components
│   │   ├── 📁 Button/
│   │   │   ├── Button.html
│   │   │   ├── Button.css
│   │   │   └── Button.js
│   │   ├── 📁 Card/
│   │   ├── 📁 Modal/
│   │   └── 📁 Form/
│   │
│   ├── 📁 layouts/           # Page layouts
│   │   ├── MainLayout.html       # Default layout
│   │   ├── SatelliteLayout.html  # For satellite pages
│   │   └── AuthLayout.html       # Login/register
│   │
│   ├── 📁 pages/             # Main site pages
│   │   ├── index.html        # Homepage
│   │   ├── shop.html         # Product listing
│   │   ├── product.html      # Product detail
│   │   ├── cart.html         # Shopping cart
│   │   ├── checkout.html     # Checkout flow
│   │   ├── account.html      # User dashboard
│   │   └── about.html        # Static pages
│   │
│   ├── 📁 assets/            # Static assets
│   │   ├── 📁 css/
│   │   │   ├── main.css          # Global styles
│   │   │   ├── variables.css     # Design tokens
│   │   │   └── utilities.css     # Helper classes
│   │   ├── 📁 js/
│   │   │   ├── main.js           # Global scripts
│   │   │   ├── cart.js           # Cart functionality
│   │   │   └── api.js            # API client
│   │   └── 📁 images/            # Static images
│   │
│   └── 📁 lib/               # Third-party libs (local)
│
├── 📄 index.html             # Entry point
├── 📄 vite.config.js         # Build config
└── 📄 package.json           # Frontend deps
```

---

## Admin Folder

```
admin/
├── 📁 src/
│   ├── 📁 components/        # Admin UI components
│   │   ├── 📁 Sidebar/       # Navigation sidebar
│   │   ├── 📁 Header/        # Top header
│   │   ├── 📁 DataTable/     # Sortable tables
│   │   ├── 📁 FormBuilder/   # Dynamic forms
│   │   ├── 📁 Chart/         # Analytics charts
│   │   └── 📁 Builder/       # Visual builder tools
│   │
│   ├── 📁 layouts/
│   │   ├── AdminLayout.html      # Super admin layout
│   │   └── SubAdminLayout.html   # Sub-admin (filtered nav)
│   │
│   ├── 📁 pages/             # Admin screens
│   │   ├── dashboard.html    # Main dashboard
│   │   ├── products.html     # Product management
│   │   ├── orders.html       # Order management
│   │   ├── users.html        # User management
│   │   ├── pages.html        # ⭐ SATELLITE HUB
│   │   ├── payments.html     # Payment settings
│   │   ├── settings.html     # Global settings
│   │   └── integrations.html # APIs, webhooks
│   │
│   ├── 📁 page-manager/      # ⭐ SUB-ADMIN PANEL
│   │   ├── dashboard.html    # Page-specific stats
│   │   ├── products.html     # Page products
│   │   ├── layout.html       # ⭐ VISUAL BUILDER
│   │   ├── content.html      # Pages, blog, FAQ
│   │   ├── users.html        # Page customers
│   │   └── settings.html     # Page settings
│   │
│   ├── 📁 assets/
│   └── 📁 lib/
│
├── 📄 index.html
├── 📄 vite.config.js
└── 📄 package.json
```

---

## API Folder

```
api/
├── 📁 src/
│   ├── 📁 config/            # Configuration
│   │   ├── database.js       # Prisma client
│   │   ├── redis.js          # Redis client
│   │   ├── email.js          # Email transport
│   │   └── storage.js        # S3/local storage
│   │
│   ├── 📁 middleware/        # Express middleware
│   │   ├── auth.js           # JWT verification
│   │   ├── authorize.js      # Role-based access
│   │   ├── rateLimit.js      # Rate limiting
│   │   ├── validate.js       # Input validation
│   │   └── errorHandler.js   # Global error handling
│   │
│   ├── 📁 routes/            # API ROUTES (modular)
│   │   ├── 📁 auth/          # Authentication
│   │   │   ├── index.js      # Route definitions
│   │   │   ├── controller.js # Business logic
│   │   │   └── validation.js # Joi/Zod schemas
│   │   │
│   │   ├── 📁 users/         # User management
│   │   ├── 📁 products/      # Product CRUD
│   │   ├── 📁 orders/        # Order processing
│   │   ├── 📁 pages/         # ⭐ SATELLITE PAGES
│   │   ├── 📁 payments/      # Payment processing
│   │   ├── 📁 settings/      # Site configuration
│   │   ├── 📁 upload/        # File uploads
│   │   └── 📁 webhooks/      # Webhook handlers
│   │       ├── stripe.js
│   │       ├── razorpay.js
│   │       └── paypal.js
│   │
│   ├── 📁 services/          # BUSINESS LOGIC
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   ├── emailService.js
│   │   ├── pageEngine.js     # ⭐ Satellite page logic
│   │   └── builderService.js # ⭐ Visual builder
│   │
│   ├── 📁 jobs/              # BACKGROUND JOBS
│   │   ├── emailQueue.js     # Email sending
│   │   ├── reportQueue.js    # Analytics reports
│   │   └── aiQueue.js        # ⭐ Future AI processing
│   │
│   └── 📁 utils/             # Helpers
│       ├── logger.js
│       ├── slugify.js
│       ├── currency.js
│       └── validators.js
│
├── 📁 prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Versioned migrations
│
├── 📄 server.js              # Entry point
├── 📄 app.js                 # Express app setup
└── 📄 package.json
```

---

## Pages Folder (Satellite Pages)

```
pages/
├── 📁 _template/             # ⭐ BASE TEMPLATE (copy for new pages)
│   ├── 📁 assets/
│   │   ├── 📁 css/
│   │   ├── 📁 js/
│   │   └── 📁 images/
│   ├── 📁 features/          # EXTEND: Add new features here
│   │   └── 📄 .gitkeep
│   ├── 📄 index.html         # Homepage
│   ├── 📄 config.json        # Page configuration
│   └── 📄 README.md          # Setup instructions
│
├── 📁 coreldraw/             # ⭐ SATELLITE PAGE: CorelDRAW Hub
│   ├── 📁 assets/
│   │   ├── 📁 css/
│   │   │   └── custom.css    # Page-specific styles
│   │   ├── 📁 js/
│   │   └── 📁 images/
│   │
│   ├── 📁 features/          # ⭐ EXTENSIBLE FEATURES
│   │   ├── 📁 macros/        # Feature: Macros & Plugins
│   │   │   ├── 📄 index.html
│   │   │   ├── 📁 assets/
│   │   │   └── 📄 config.json    # { name: "Macros", icon: "zap", position: 2 }
│   │   │
│   │   ├── 📁 plugins/       # Feature: Plugins
│   │   │   ├── 📄 index.html
│   │   │   └── 📄 config.json
│   │   │
│   │   ├── 📁 designs/       # Feature: Design Bundles
│   │   │   ├── 📄 index.html
│   │   │   └── 📄 config.json
│   │   │
│   │   ├── 📁 lasercut/      # Feature: Laser Cut
│   │   │   ├── 📄 index.html
│   │   │   └── 📄 config.json
│   │   │
│   │   └── 📁 cdr-converter/ # ⭐ NEW: Drop in new feature
│   │       ├── 📄 index.html     # Tool interface
│   │       ├── 📁 assets/        # Tool-specific files
│   │       └── 📄 config.json    # Auto-registers with navigation
│   │
│   ├── 📄 index.html         # Homepage
│   ├── 📄 config.json        # { name: "CorelDRAW Hub", slug: "coreldraw", ... }
│   └── 📄 README.md
│
├── 📁 ai-lab/                # ⭐ SATELLITE PAGE: AI Workflow Lab
│   ├── 📁 assets/
│   ├── 📁 features/
│   │   ├── 📁 n8n/
│   │   ├── 📁 claude/
│   │   ├── 📁 prompts/
│   │   └── 📁 [NEW-FEATURE]/   # Add new AI tool here
│   ├── 📄 index.html
│   └── 📄 config.json
│
├── 📁 design-arsenal/        # ⭐ SATELLITE PAGE: Design Arsenal
│   ├── 📁 assets/
│   ├── 📁 features/
│   ├── 📄 index.html
│   └── 📄 config.json
│
└── 📄 .gitignore             # Ignore auto-generated files
```

---

## Modules Folder (Shared Components)

```
modules/
├── 📁 header/                # HEADER MODULE (extensible)
│   ├── 📁 core/
│   │   ├── 📄 template.html  # Base structure
│   │   ├── 📄 style.css
│   │   └── 📄 script.js
│   │
│   ├── 📁 features/          # ⭐ EXTENSIBLE FEATURES
│   │   ├── 📁 logo/
│   │   │   ├── 📄 template.html
│   │   │   ├── 📄 config.json    # { name: "Logo", position: 1 }
│   │   │   └── 📄 README.md
│   │   │
│   │   ├── 📁 navigation/
│   │   │   ├── 📄 template.html
│   │   │   ├── 📄 config.json
│   │   │   └── 📄 Dropdown/      # Sub-component
│   │   │
│   │   ├── 📁 search/
│   │   │   ├── 📄 template.html
│   │   │   ├── 📄 config.json
│   │   │   └── 📄 autocomplete.js
│   │   │
│   │   ├── 📁 cart/
│   │   │   ├── 📄 template.html
│   │   │   ├── 📄 config.json
│   │   │   └── 📄 cart-drawer.js
│   │   │
│   │   ├── 📁 user-menu/
│   │   │   ├── 📄 template.html
│   │   │   └── 📄 config.json
│   │   │
│   │   └── 📁 announcement-bar/  # NEW: Drop in feature
│   │       ├── 📄 template.html
│   │       ├── 📄 config.json
│   │       └── 📄 README.md
│   │
│   └── 📄 index.js           # Module loader
│
├── 📁 footer/
│   ├── 📁 core/
│   └── 📁 features/
│       ├── 📁 columns/
│       ├── 📁 social-links/
│       ├── 📁 payment-icons/
│       └── 📁 newsletter/
│
├── 📁 sidebar/
│   ├── 📁 core/
│   └── 📁 features/
│       ├── 📁 categories/
│       ├── 📁 price-filter/
│       ├── 📁 rating-filter/
│       └── 📁 [NEW-WIDGET]/      # Add new widget here
│
├── 📁 product-card/
│   ├── 📄 template.html
│   ├── 📄 style.css
│   └── 📄 script.js
│
├── 📁 landing-sections/      # ⭐ LANDING PAGE BUILDER
│   ├── 📁 hero/
│   │   ├── 📄 template.html
│   │   ├── 📄 config-schema.json # Builder configuration
│   │   └── 📄 preview.png        # Visual preview
│   │
│   ├── 📁 feature-grid/
│   ├── 📁 testimonials/
│   ├── 📁 faq/
│   ├── 📁 cta-bar/
│   └── 📁 [NEW-SECTION]/         # Add new section type here
│       ├── 📄 template.html
│       ├── 📄 config-schema.json
│       └── 📄 README.md
│
└── 📁 forms/                 # Form components
    ├── 📁 input/
    ├── 📁 select/
    ├── 📁 checkbox/
    └── 📁 rich-text/
```

---

## Shared Folder

```
shared/
├── 📁 database/
│   ├── 📁 migrations/
│   └── 📄 seed.js            # Initial data
│
├── 📁 email-templates/
│   ├── 📁 transactional/
│   │   ├── 📄 order-confirmation.html
│   │   ├── 📄 order-shipped.html
│   │   ├── 📄 welcome.html
│   │   └── 📄 reset-password.html
│   │
│   └── 📁 marketing/
│       ├── 📄 new-product.html
│       └── 📄 weekly-newsletter.html
│
├── 📁 utils/
│   ├── 📄 constants.js       # App constants
│   ├── 📄 helpers.js         # Shared functions
│   ├── 📄 formatters.js      # Date, currency, etc.
│   └── 📄 validators.js      # Shared validation
│
└── 📁 types/                 # TypeScript defs (if using)
    ├── 📄 user.d.ts
    ├── 📄 product.d.ts
    └── 📄 order.d.ts
```

---

## Config Folder

```
config/
├── 📄 site.defaults.json     # Default site configuration
├── 📄 navigation.schema.json # Navigation structure validation
├── 📄 page-templates.json    # Available satellite templates
├── 📄 feature-registry.json  # Auto-generated feature list
└── 📄 ai-agents.json         # Future: Agent configurations
```

---

## Extension Examples

### Adding New Satellite Page

```bash
# 1. Copy template
cp -r pages/_template pages/photoshop

# 2. Edit config.json

# 3. Customize features/

# 4. Restart server → Auto-registered
```

### Adding Feature to Existing Page

```bash
# 1. Create folder
mkdir pages/coreldraw/features/cdr-viewer

# 2. Add files
#   - index.html (tool interface)
#   - config.json (registration)
#   - assets/ (tool files)

# 3. Auto-appears in navigation
```

### Adding New Header Feature

```bash
# 1. Create folder
mkdir modules/header/features/language-switcher

# 2. Add template.html, config.json

# 3. Available in Header Builder immediately
```

### Adding New Landing Section

```bash
# 1. Create folder
mkdir modules/landing-sections/pricing-table

# 2. Add template.html, config-schema.json

# 3. Appears in "Add Section" dropdown
```

---

## Naming Conventions

| Element | Convention | Example |
|:--------|:-----------|:--------|
| Folders | kebab-case | `cdr-converter/`, `landing-sections/` |
| Files | kebab-case | `config-schema.json`, `order-confirmation.html` |
| Components | PascalCase | `DataTable/`, `FormBuilder/` |
| Variables | camelCase | `pageConfig`, `userRole` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `CURRENCY_DEFAULT` |
| CSS Classes | kebab-case | `btn-primary`, `card-hover` |
| Database tables | snake_case | `order_items`, `page_admins` |

---

## Git Workflow

```
main branch (production)
  ↓
develop branch (integration)
  ↓
feature/satellite-pages
feature/visual-builder
feature/payment-gateway
  ↓
Pull Request → Code Review → Merge to develop → Test → Merge to main
```

---

## Environment Setup

```bash
# Clone repo
git clone [repo-url]
cd digikraft-shop

# Install dependencies
npm install
cd frontend && npm install
cd ../admin && npm install
cd ../api && npm install

# Start services
docker-compose up -d  # PostgreSQL, Redis

# Run migrations
cd api && npx prisma migrate dev

# Seed data
npx prisma db seed

# Start dev servers
npm run dev:frontend  # :3000
npm run dev:admin     # :3001
npm run dev:api       # :8080
```

---

## Related Documents

- [PRD](PRD.md) - Product Requirements
- [Tech Stack](Tech%20Stack.md) - Technology choices
- [Frontend UI](Frontend%20UI.md) - UI specifications
- [Implementation Plan](Implementation%20Plan.md) - Development timeline
