# DigiKraft Admin Panel — Complete System Documentation
> Last updated: April 2026 — Full rebuild prompt. An AI agent reading this file can recreate the exact same admin panel, backend, and main website from scratch without errors.

---

## 1. SYSTEM OVERVIEW

DigiKraft is a premium digital marketplace (like Envato/Creative Market) for Indian designers. It sells digital products: graphics, fonts, templates, UI kits, plugins, 3D assets.

### Three Services — Fixed Ports (NEVER CHANGE)

| Service | Port | Start Command | Directory |
|---------|------|---------------|-----------|
| Admin Panel | **3000** | `python -m http.server 3000` | `digikraft.shop/frontend/src/admin/` |
| Main Website | **3001** | `npm run dev` | `digikraft.shop/main-website/` |
| Backend API | **8080** | `node server.js` | `digikraft.shop/backend/` |

### Admin Credentials
- Email: `admin@digikraft.shop`
- Password: `admin123`

### Currency
- INR (₹) throughout — never USD

---

## 2. ADMIN PANEL — ARCHITECTURE

### Tech Stack
- **Pure HTML + Vanilla JavaScript** — no framework, no build step
- **Single HTML file**: `frontend/src/admin/index.html` (~3000+ lines)
- **Modular JS**: separate `.js` files in `modules/` and `js/views/`
- **Served by**: Python HTTP server (`python -m http.server 3000`)
- **Talks to**: Backend API at `http://localhost:8080`

### File Structure
```
frontend/src/admin/
├── index.html                  ← Main SPA shell, all CSS variables, navigation, page router
├── css/
│   ├── styles.css              ← Global admin styles (dark/light theme variables)
│   └── theme-toggle.css        ← Theme toggle button styles
├── js/
│   ├── api.js                  ← AdminAPI client (all HTTP calls to backend)
│   └── views/
│       └── products.js         ← Products view (grid/table, AI generate, CRUD)
└── modules/
    ├── appearance-advanced.js  ← Site Customizer (syncs to backend → main website)
    ├── ai-automation.js        ← AI product listing from URLs and PDFs
    ├── ai-hub.js               ← AI model manager, purposes, agents, email/SMTP + templates
    ├── blog-editor.js          ← Blog editor with AI generation
    ├── categories-advanced.js  ← Category management
    ├── coupons-advanced.js     ← Coupon management
    ├── customers-enhanced.js   ← Full CRM: customer list, profile modal, edit, WhatsApp
    ├── digiprofile.js          ← DigiProfile (Linktree clone) management
    ├── email-templates.js      ← Email template builder (shared by Settings + AI Hub)
    ├── inventory.js            ← Inventory tracking
    ├── landing-pages.js        ← Landing page builder
    ├── license-gen.js          ← License key generation
    ├── license-ui.js           ← License UI
    ├── notifications.js        ← Notification system
    ├── portals.js              ← Portal browser
    ├── reports.js              ← Reports
    ├── reviews.js              ← Review management
    ├── subscriptions.js        ← Subscription management
    ├── whatsapp.js             ← WhatsApp integration
    └── workflow.js             ← Workflow automation
```

### Navigation Structure (Sidebar)
The admin panel is a Single Page Application. Navigation is handled by `navigate(page)` function in `index.html`.

**Sidebar sections:**
- **OVERVIEW**: Dashboard
- **STORE**: Products, Orders, Customers, Categories, Coupons
- **CONTENT**: Satellite Pages, Media Library, Blog Posts, Landing Pages
- **BUSINESS**: Payments, Vendors, Subscriptions, Affiliate, Reseller Hub, WhatsApp, DigiProfile
- **SYSTEM**: Analytics, Reports
- **TOOLS**: Inventory, License Gen, Portal Browser, Reviews, Workflows, Activity Log, AI Automation (NEW), AI Hub, Appearance, Settings

### Page Router Pattern
```javascript
const pages = {
  dashboard: renderDashboard,
  products: () => ProductsView.render(),
  blog: () => window.renderBlog ? window.renderBlog() : renderBlogFromAPI(),
  ai: renderAI,
  'ai-hub': () => window.renderAIHub ? window.renderAIHub() : '...',
  appearance: () => window.renderAppearance ? window.renderAppearance() : renderAppearance(),
  settings: renderSettings,
  // ... etc
}
```

Modules loaded via `<script src="modules/xxx.js" defer>` in `index.html`. They expose functions on `window.*`.

### Post-Render Hook
After every page render, `_postRenderHook()` fires to load async sections that cannot run inside template literals:
```javascript
function _postRenderHook() {
  // Settings > Email — load email templates section
  const settingsTplWrap = document.getElementById('settings-email-tpl-wrap');
  if (settingsTplWrap && window.renderEmailTemplatesSection) {
    window.renderEmailTemplatesSection().then(html => { settingsTplWrap.innerHTML = html; });
  }
  // AI Hub > Email — load email templates section
  const aiHubTplWrap = document.getElementById('ai-hub-email-templates');
  if (aiHubTplWrap && window.renderEmailTemplatesSection) {
    window.renderEmailTemplatesSection().then(html => { aiHubTplWrap.innerHTML = html; });
  }
}
```

---

## 3. BACKEND API — ARCHITECTURE

### Tech Stack
- **Node.js + Express.js**
- **Database**: NeDB (flat-file, no installation needed) — stored in `backend/data/`
- **Auth**: JWT (two secrets: `JWT_SECRET` for customers, `ADMIN_JWT_SECRET` for admin)
- **File uploads**: Multer → `backend/uploads/`
- **AI**: OpenRouter API (Claude 3.5 Haiku by default)

### Environment Variables (`backend/.env`)
```
PORT=8080
JWT_SECRET=digikraft_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
ADMIN_JWT_SECRET=digikraft_admin_jwt_secret_2024
DB_PATH=./data
UPLOAD_DIR=./uploads
OPENROUTER_API_KEY=sk-or-v1-...
```

### Database Collections (NeDB)
```
backend/data/
├── products.db
├── categories.db
├── customers.db          ← Customers + admin users (now stores phone, cart_items, wishlist)
├── orders.db
├── downloads.db
├── coupons.db
├── licenses.db
├── reviews.db
├── notifications.db
├── settings.db           ← Site settings + AI config + appearance config
├── workflow_logs.db
├── satellite_pages.db
├── blog_posts.db
├── vendors.db
├── subscriptions.db
├── product_files.db
├── digiprofiles.db
├── affiliates.db
├── affiliate_clicks.db
├── affiliate_conversions.db
└── email_templates.db    ← Email templates (NEW)
```

### All API Routes
```
POST /api/admin/login
POST /api/customer/login
POST /api/customer/register        ← Now accepts optional `phone` field
GET  /api/customer/profile
PUT  /api/customer/profile         ← Now accepts cart_items, wishlist for sync

GET/POST   /api/v1/products
GET/PUT/DELETE /api/v1/products/:id
POST /api/v1/products/bulk-import

GET/POST   /api/v1/categories
GET/PUT/DELETE /api/v1/categories/:id

GET/POST   /api/v1/orders
GET/PUT    /api/v1/orders/:id

GET/POST   /api/v1/customers
GET/PUT    /api/v1/customers/:id   ← Now accepts city, cart_items, wishlist
POST /api/v1/customers/:id/coupon

GET/POST   /api/v1/coupons
POST /api/v1/coupons/validate

GET/POST   /api/v1/reviews
PUT/DELETE /api/v1/reviews/:id

GET/POST   /api/v1/blog
GET/PUT/DELETE /api/v1/blog/:slug
POST /api/v1/blog-ai/generate
POST /api/v1/blog-ai/from-pdf
POST /api/v1/blog-ai/seo
GET/POST/DELETE /api/v1/blog-ai/categories

GET/POST   /api/v1/satellite-pages
GET/PUT/DELETE /api/v1/satellite-pages/:slug

GET        /api/v1/product-files/:productId
POST       /api/v1/product-files/:productId/upload
DELETE     /api/v1/product-files/:productId/:fileId

GET/POST   /api/v1/subscriptions
GET/POST   /api/v1/licenses
POST       /api/v1/licenses/issue
GET/POST   /api/v1/vendors

GET        /api/v1/dashboard
GET        /api/v1/analytics
GET/PUT    /api/v1/settings
GET        /api/v1/settings/public
GET/PUT    /api/v1/notifications

POST /api/v1/ai/analyze-url
POST /api/v1/ai/analyze-pdf
POST /api/v1/ai/create-product
POST /api/v1/ai/batch-create
GET/PUT    /api/v1/ai/config
POST /api/v1/ai/generate-thumbnail

GET/POST/PUT/DELETE /api/v1/ai-hub/models
POST /api/v1/ai-hub/models/:id/test
GET/PUT    /api/v1/ai-hub/purposes
GET/POST/DELETE /api/v1/ai-hub/agents
GET/PUT    /api/v1/ai-hub/email
POST /api/v1/ai-hub/email/test

GET/POST/PUT/DELETE /api/v1/email-templates     ← NEW
POST /api/v1/email-templates/:id/send-test      ← NEW

GET/POST/PUT/DELETE /api/v1/digiprofile
GET /api/v1/digiprofile/public/:username
POST /api/v1/digiprofile/:id/click

GET /api/downloads
GET /api/public/products
GET /api/public/categories
GET /health
```

---

## 4. CUSTOMERS MODULE (UPDATED)

### Customer List (`modules/customers-enhanced.js`)

**Actions column** now has three buttons per customer:
1. **Profile** (blue) — opens full CRM modal
2. **Issue Coupon** (grey) — quick coupon modal
3. **WhatsApp** (green `#25D366`) — opens `wa.me/[phone]` directly in new tab. If no phone on file, shows a disabled greyed-out icon.

### Customer CRM Modal
Opened via `openCustomerCRM(id)`. Full-screen overlay with:

**Header:**
- Customer avatar, name, email, phone, status badge, affiliate badge
- **WhatsApp button** (green) — direct chat link
- **Issue Coupon** button
- **Edit** button → opens `openEditCustomerModal(id)`
- Close (×)

**Sections (2-column grid):**
1. **Contact Details** — email, phone (with inline WhatsApp "Chat" badge), city, joined date, role, notes
2. **Purchase Overview** — stats grid: total orders, total spent, avg order, downloads, reviews, coupons. VIP/Loyal badges.
3. **Purchase History** — full orders table (order #, items, total, payment status, order status, date)
4. **Cart Items** *(NEW)* — shows customer's current cart synced from frontend: product image, name, qty, price. Cart total at bottom.
5. **Wishlist** *(NEW)* — shows customer's wishlist synced from frontend: product image, name, category, price.
6. **Personal Coupons** — list of issued coupons with code, discount, status
7. **Affiliate Dashboard** (if affiliate) — referral code, commission, clicks, sales, earnings, payout. Approve/Suspend/Set Rate actions.
8. **Reviews** (if any) — star rating + comment cards

### Edit Customer Modal (`openEditCustomerModal(id)`)
Full edit form with:
- **Full Name** (editable)
- **Email** (locked — cannot change for security)
- **Phone / WhatsApp** (editable, used for WhatsApp contact)
- **City** (editable)
- **Role** — Customer / Admin dropdown
- **Status** — Active / Suspended / Deleted dropdown
- **Internal Notes** (textarea)
- Save via `AdminAPI.updateCustomer(id, updates)` then refreshes CRM modal

### Customer Data Model (Updated)
```javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,          // ← used for WhatsApp
  city: string,           // ← NEW field
  role: 'customer'|'admin',
  status: 'active'|'suspended'|'deleted',
  tags: string[],
  notes: string,
  total_orders: number,
  total_spent: number,
  cart_items: Array,      // ← synced from frontend localStorage (NEW)
  wishlist: Array,        // ← synced from frontend localStorage (NEW)
  created_at: Date,
  updated_at: Date
}
```

### Cart & Wishlist Sync
- **Frontend → Backend**: When a logged-in customer modifies their cart or wishlist, the stores silently call `PUT /api/customer/profile` with `{ cart_items: [...] }` or `{ wishlist: [...] }`.
- **Admin reads**: `GET /api/v1/customers/:id` returns `cart_items` and `wishlist` arrays.
- Cart item shape: `{ id, name, price, image, quantity, category }`
- Wishlist item shape: `{ id, name, price, image, category }`

---

## 5. EMAIL TEMPLATES SYSTEM (NEW)

### Overview
A full email template builder available in **two places**:
- **Settings → Email tab** (bottom section)
- **AI Hub → Email tab** (bottom section)

Both use the same shared module: `modules/email-templates.js`

### Template Editor (`openEmailTemplateEditor(id)`)
Full-screen modal with:

**Fields:**
- **Template Title** — internal name (required)
- **From Name** — sender display name (defaults to "DigiKraft")
- **From Email** — sender address (overrides SMTP default per template)
- **Email Subject** — supports `{{variables}}` (required)
- **Trigger** — when to send (see triggers below)
- **Delay After Trigger** — numeric value + unit (minutes/hours/days)
- **Email Body** — HTML editor with:
  - Default branded HTML template pre-filled
  - **Variables picker** — click to insert `{{var}}` at cursor position
  - **Preview button** — renders HTML with sample data in-place

**Available template variables:**
```
{{customer_name}}   {{customer_email}}   {{order_number}}
{{order_total}}     {{product_name}}     {{download_link}}
{{coupon_code}}     {{store_name}}       {{site_url}}
```

### Trigger Options (13 total)
| Trigger | Description |
|---------|-------------|
| `order_placed` | Fires immediately when customer places an order |
| `order_completed` | Fires when order status → completed |
| `order_cancelled` | Fires when order is cancelled |
| `payment_failed` | Fires when a payment attempt fails |
| `customer_registered` | Fires on new customer registration |
| `password_reset` | Fires on password reset request |
| `review_request` | Fires after delivery to ask for review |
| `coupon_issued` | Fires when a personal coupon is issued |
| `subscription_started` | Fires when subscription begins |
| `subscription_expired` | Fires when subscription expires |
| `download_ready` | Fires when digital product is ready |
| `vendor_assigned` | Fires when order assigned to vendor |
| `custom` | Manual / API triggered |

### Template List
Each template row shows:
- Trigger emoji + name, delay, subject line
- **Enable/Disable toggle** (inline, no page reload)
- **Edit** button
- **Send Test** button (prompts for email address)
- **Delete** button

### Backend (`routes/email-templates.js`)
```
GET    /api/v1/email-templates           ← list all templates (admin)
GET    /api/v1/email-templates/:id       ← get single template
POST   /api/v1/email-templates           ← create template
PUT    /api/v1/email-templates/:id       ← update template
DELETE /api/v1/email-templates/:id       ← delete template
POST   /api/v1/email-templates/:id/send-test  ← send test email
```

### Template Data Model
```javascript
{
  id: number,
  _type: 'email_template',   // internal discriminator
  title: string,
  subject: string,
  body: string,              // HTML
  from_name: string,
  from_email: string,
  trigger: string,           // one of 13 trigger values
  delay_value: number,       // 0 = immediate
  delay_unit: 'minutes'|'hours'|'days',
  enabled: boolean,
  created_at: Date,
  updated_at: Date
}
```

---

## 6. CHECKOUT — PHONE MANDATORY (UPDATED)

### Change
The checkout page (`main-website/pages/checkout.vue`) now requires a **Phone / WhatsApp** number before purchase can complete.

**Behavior:**
- Phone field added to "Contact Information" section
- Marked required with red asterisk
- Validates on blur: must be non-empty and have ≥7 digits
- Blocks checkout if invalid — focuses the field
- On successful checkout, phone is synced to customer's backend profile via `PUT /api/customer/profile { phone }`
- Helper text: "We'll use this to send your order updates via WhatsApp"

### Registration
`POST /api/customer/register` now accepts optional `phone` field and saves it to the customer record.

---

## 7. MAIN WEBSITE — CART & WISHLIST SYNC (NEW)

### Cart Store (`stores/cart.ts`)
`saveToLocalStorage()` now also calls `syncToBackend()` after every cart change:
```typescript
async syncToBackend() {
  // reads token from localStorage
  // calls PUT /api/customer/profile { cart_items: [...] }
  // non-blocking, silent fail
}
```

### Wishlist Store (`stores/wishlist.ts`)
`persist()` now also calls `syncToBackend()` after every wishlist change:
```typescript
async syncToBackend() {
  // reads token from localStorage
  // calls PUT /api/customer/profile { wishlist: [...] }
  // non-blocking, silent fail
}
```

Both syncs only fire when a user is logged in (token present in localStorage).

---

## 8. APPEARANCE SYNC SYSTEM

This is the most critical sync mechanism. Admin controls website appearance.

### How It Works
1. Admin edits appearance in `modules/appearance-advanced.js`
2. `saveSiteCfg(v)` is **async** — saves to localStorage AND calls `AdminAPI.updateSettings({ site_config: JSON.stringify(v) })`
3. Backend stores `site_config` as a string value in `settings.db`
4. Main website `app.vue` calls `loadFromBackend()` on mount
5. `loadFromBackend()` fetches `/api/v1/settings/public`, parses `site_config` JSON, updates reactive `siteConfig`
6. All components reactively update

### What site_config Controls
```json
{
  "topbar": { "enabled": true, "announcement": "...", "socialLinks": {}, "navLinks": [] },
  "rightSidebar": { "enabled": true, "sections": {}, "hotOffers": [], "trending": [], "promo": {} },
  "homepage": { "heroEnabled": true, "heroTitle": "...", "featuredEnabled": true, ... },
  "branding": { "siteName": "DigiKraft.shop", "primaryColor": "#6366f1", ... },
  "blog": { "articles": [] }
}
```

### Critical Bug Fix (Already Applied)
```javascript
rows.forEach(r => {
  const key = (r.key || '').trim()  // ← MUST trim whitespace
  if (publicKeys.has(key)) settings[key] = r.value
})
```

---

## 9. AI AUTOMATION SYSTEM

### AI Product Listing (`modules/ai-automation.js`)
- Paste URL → backend scrapes → AI → full product data
- Upload PDF → extract URLs → analyze each

### AI Blog Generation (`modules/blog-editor.js`)
- Topic → AI generates full article
- PDF/MD reference upload
- Link products, choose AI model, save draft or publish

### AI Hub (`modules/ai-hub.js`) — 4 tabs
1. **Models** — add any AI provider (OpenRouter, OpenAI, Anthropic, Google, Moonshot/Kimi, Mistral, Groq, Together, custom)
2. **Purposes** — assign model per task
3. **Agents** — Email, WhatsApp, Support, Vendor, SEO, Review, Call, Hermes
4. **Email & SMTP** — SMTP config (Gmail/Outlook/Zoho/SendGrid presets), Google OAuth, trigger toggles, **Email Templates section** (shared with Settings)

---

## 10. PRODUCTS MODULE

### Products View (`js/views/products.js`)
- Grid/Table view, status tabs, category filter, search
- Add Product modal: 4 tabs (Basic Info, Media & Files, Details, SEO)
- AI Generate bar: paste URL → fills all fields
- File upload: drag & drop

### Product Data Model
```javascript
{
  id, title, slug, description, short_description,
  price, sale_price, image, images,
  category_ids: number[],
  tags, status, featured, show_on_main,
  file_format, file_size, version, license,
  seo_title, seo_desc,
  downloads, rating, review_count,
  ai_generated, created_at, updated_at
}
```

---

## 11. BLOG MODULE

### Blog Editor (`modules/blog-editor.js`)
- All articles from backend (not localStorage)
- Status tabs: All / Published / Drafts
- Three creation methods: AI Generate, Write Article, Upload PDF/MD

**Blog GET route auth fix**: Uses custom JWT verification (tries both secrets) because admin JWT uses `ADMIN_JWT_SECRET`.

---

## 12. DIGIPROFILE SYSTEM

DigiProfile is a Linktree/SuperProfile clone built into the main website.

### Admin Module (`modules/digiprofile.js`)
10-tab editor: Basic / Theme / Links / Products / Social / Razorpay / Instagram / Automation / KYC / SEO

### Public Page (`pages/p/[username].vue`)
5 themes, links, social icons, products, Razorpay donations, share button, Meta Pixel, SEO

---

## 13. SETTINGS MODULE

### Settings → Email Tab (Updated)
The email tab now has **three sections**:
1. **SMTP Settings** — host, port, encryption, username, password, from name, from email, send test
2. **Email Notifications** — toggles for New Order, Order Completed, New Customer, Failed Payment, New Review, Low Stock
3. **Email Templates** *(NEW)* — full template builder (see Section 5)

### Settings stored in `settings.db`
Key settings:
- `site_name`, `site_tagline`, `currency`, `currency_symbol`
- `contact_email`, `whatsapp_number`
- `payment_*` keys (razorpay, stripe, paypal, upi, etc.)
- `tax_rate`, `min_order`
- `site_config` ← Full appearance JSON
- `openrouter_api_key`, `openai_api_key`, `gemini_api_key`
- `ai_models`, `ai_purposes`, `ai_agents`
- `blog_categories`
- `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_from_name`, `smtp_from_email`
- `google_client_id`, `google_client_secret`, `google_redirect_uri`

---

## 14. PAYMENT SYSTEM

### Supported Gateways
Razorpay (primary, INR), Stripe, PayPal, UPI, PhonePe, Paytm, Cashfree

### Checkout Flow
1. Customer adds to cart → `/checkout`
2. **Phone number required** (NEW) — validated before proceeding
3. Selects payment method
4. Order created in DB with `payment_status: 'paid'`
5. Phone synced to customer profile
6. Download links generated

---

## 15. REBUILD INSTRUCTIONS

### Step 1: Backend
```bash
mkdir backend && cd backend
npm init -y
npm install express cors helmet morgan express-rate-limit jsonwebtoken bcryptjs @seald-io/nedb multer axios cheerio pdf-parse openai@4 nodemailer dotenv
```

### Step 2: Admin Panel
Create `frontend/src/admin/index.html` as a single-file SPA with:
- Dark/light theme CSS variables
- Sidebar navigation
- `navigate(page)` router + `_postRenderHook()` for async sections
- `AdminAPI` client in `js/api.js`
- All modules loaded via `<script defer>`

### Step 3: Main Website
```bash
npx nuxi init main-website
cd main-website
npm install pinia @pinia/nuxt
```
Configure `nuxt.config.ts` with `devServer: { port: 3001 }`.

### Step 4: Critical Rules
1. **Ports are fixed**: Admin=3000, Website=3001, Backend=8080
2. **Currency is INR (₹)** throughout
3. **Admin panel is vanilla JS** — no React/Vue/Angular
4. **Database is NeDB** — no MongoDB/PostgreSQL needed
5. **Appearance sync**: Admin saves `site_config` to backend → website reads on mount
6. **Blog auth**: GET /api/v1/blog must try both JWT secrets to detect admin
7. **Slug deduplication**: Always auto-increment, never return 400 "slug exists"
8. **getNextId**: Must scan ALL docs for max id
9. **site_config key**: Must `.trim()` keys in public settings endpoint
10. **Phone mandatory at checkout**: Validate before allowing order submission
11. **Cart/Wishlist sync**: Frontend stores silently sync to backend on every change
12. **Email templates**: Stored in `email_templates.db`, shared between Settings and AI Hub tabs
13. **Post-render hook**: `_postRenderHook()` must fire after every page render to load async sections

---

## 16. START ALL SERVICES

```bash
# Terminal 1 — Backend
cd digikraft.shop/backend
node server.js

# Terminal 2 — Main Website
cd digikraft.shop/main-website
npm run dev

# Terminal 3 — Admin Panel
cd digikraft.shop/frontend/src/admin
python -m http.server 3000
```

URLs:
- Admin Panel: http://localhost:3000
- Main Website: http://localhost:3001
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/health

---

## 17. CHANGELOG

### April 2026 — Session Updates
| Area | Change |
|------|--------|
| Customers — table | WhatsApp button added to Actions column (green, opens `wa.me/[phone]`; disabled if no phone) |
| Customers — CRM modal | WhatsApp button in header, Edit button, phone shows inline WhatsApp "Chat" badge |
| Customers — CRM modal | Cart Items section (NEW) — shows synced cart with product image, name, qty, price, total |
| Customers — CRM modal | Wishlist section (NEW) — shows synced wishlist with product image, name, category, price |
| Customers — Edit modal | Full edit form: name, phone, city, role, status, notes. Email locked. |
| Backend — customers route | `GET /:id` returns `cart_items` and `wishlist`. `PUT /:id` accepts `city`, `cart_items`, `wishlist` |
| Backend — auth route | `POST /register` saves optional `phone`. `PUT /profile` accepts `cart_items`, `wishlist` |
| Checkout | Phone/WhatsApp field added — **required**, validates before order, syncs to profile |
| Cart store | `syncToBackend()` added — silently syncs cart to backend on every change |
| Wishlist store | `syncToBackend()` added — silently syncs wishlist to backend on every change |
| Email Templates | New module `email-templates.js` — full template builder with 13 triggers, delay, HTML editor, preview, variables |
| Email Templates | Available in **Settings → Email** AND **AI Hub → Email** (shared module) |
| Backend | New route `routes/email-templates.js` — full CRUD + test send |
| Backend | New datastore `email_templates.db` |
| Settings → Email tab | Now has 3 sections: SMTP, Notifications, Email Templates |
| AI Hub → Email tab | Now has Email Templates section at bottom |
| Admin panel render | `_postRenderHook()` added to load async sections after page render |
| Categories | Removed redundant "Add Root Category" + "Add Category" buttons — replaced with single **"+ New Category"** button. Parent dropdown inside the editor handles root vs subcategory. |
