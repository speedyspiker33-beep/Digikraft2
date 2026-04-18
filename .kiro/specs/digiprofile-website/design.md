# Design Document: DigiProfile Website

## Overview

DigiProfile is a standalone SaaS platform — separate from digikraft.shop — that lets creators, influencers, and small businesses build a SuperProfile/Linktree-style digital presence. Users self-register, get a public profile page at `/p/:username`, sell digital products, accept payments via Razorpay, and automate Instagram DMs using the Meta Graph API.

---

## High-Level Design

### 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DigiProfile Platform                        │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │  Marketing Site  │    │  Creator Dashboard│                  │
│  │  (Nuxt.js SSG)   │    │  (Nuxt.js SPA)   │                  │
│  │  /               │    │  /dashboard/*    │                  │
│  │  /pricing        │    │  /onboarding     │                  │
│  │  /features       │    │  /settings       │                  │
│  └────────┬─────────┘    └────────┬─────────┘                  │
│           │                       │                             │
│  ┌────────▼───────────────────────▼─────────┐                  │
│  │           Public Profile Pages            │                  │
│  │           (Nuxt.js SSR/ISR)               │                  │
│  │           /p/:username                    │                  │
│  └────────────────────┬──────────────────────┘                  │
│                       │                                         │
│  ┌────────────────────▼──────────────────────┐                  │
│  │         DigiProfile API (Node.js/Express) │                  │
│  │         Port: 4000                        │                  │
│  │                                           │                  │
│  │  /api/auth        /api/profiles           │                  │
│  │  /api/links       /api/products           │                  │
│  │  /api/analytics   /api/payments           │                  │
│  │  /api/automation  /api/webhooks           │                  │
│  │  /api/kyc         /api/subscriptions      │                  │
│  └────────────────────┬──────────────────────┘                  │
│                       │                                         │
│  ┌────────────────────▼──────────────────────┐                  │
│  │              Database Layer               │                  │
│  │  SQLite (better-sqlite3) — single file    │                  │
│  │  digiprofile.db                           │                  │
│  └───────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘

External Services:
  Meta Graph API  ──→  Instagram DM Automation
  Razorpay API    ──→  Payments, Subscriptions, Donations
  Cloudinary/S3   ──→  File uploads (avatars, digital products)
  Nodemailer      ──→  Transactional emails
```

### 2. Project Structure

```
digiprofile/
├── frontend/                    # Nuxt.js 3 app
│   ├── pages/
│   │   ├── index.vue            # Marketing homepage
│   │   ├── pricing.vue          # Pricing page
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── onboarding.vue       # Post-signup setup wizard
│   │   ├── p/
│   │   │   └── [username].vue   # Public profile page
│   │   └── dashboard/
│   │       ├── index.vue        # Dashboard home (analytics)
│   │       ├── links.vue        # Link manager
│   │       ├── products.vue     # Digital products
│   │       ├── automation.vue   # Instagram DM automation
│   │       ├── payments.vue     # Razorpay settings
│   │       ├── analytics.vue    # Detailed analytics
│   │       ├── appearance.vue   # Theme & profile editor
│   │       ├── kyc.vue          # KYC submission
│   │       └── settings.vue     # Account settings
│   ├── components/
│   │   ├── profile/             # Public profile components
│   │   │   ├── ProfileHeader.vue
│   │   │   ├── LinkButton.vue
│   │   │   ├── ProductCard.vue
│   │   │   ├── SocialIcons.vue
│   │   │   ├── DonationWidget.vue
│   │   │   └── InstagramFeed.vue
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── Sidebar.vue
│   │   │   ├── StatsCard.vue
│   │   │   ├── LinkEditor.vue
│   │   │   ├── AutomationRule.vue
│   │   │   └── AnalyticsChart.vue
│   │   └── shared/
│   │       ├── ThemePreview.vue
│   │       └── UploadZone.vue
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   ├── analytics.ts
│   │   └── automation.ts
│   ├── composables/
│   │   ├── useProfile.ts
│   │   ├── useAnalytics.ts
│   │   └── useRazorpay.ts
│   └── nuxt.config.ts           # devServer port: 4001
│
├── backend/                     # Node.js/Express API
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profiles.js
│   │   ├── links.js
│   │   ├── products.js
│   │   ├── analytics.js
│   │   ├── payments.js
│   │   ├── automation.js
│   │   ├── webhooks.js          # Meta webhook handler
│   │   ├── kyc.js
│   │   └── subscriptions.js
│   ├── middleware/
│   │   ├── auth.js              # JWT middleware
│   │   ├── rateLimit.js
│   │   └── upload.js            # Multer file upload
│   ├── services/
│   │   ├── meta.js              # Meta Graph API client
│   │   ├── razorpay.js          # Razorpay client
│   │   ├── email.js             # Nodemailer
│   │   └── storage.js           # File storage
│   ├── db/
│   │   ├── database.js          # SQLite connection + helpers
│   │   └── migrations/          # Schema migrations
│   ├── data/
│   │   └── digiprofile.db       # SQLite database file
│   ├── uploads/                 # Local file storage
│   ├── server.js
│   └── package.json
│
└── README.md
```

### 3. Core Data Models

#### users
```sql
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,           -- bcrypt hash
  name        TEXT,
  phone       TEXT,
  plan        TEXT DEFAULT 'free',     -- free | pro | business
  plan_status TEXT DEFAULT 'active',   -- active | expired | cancelled
  plan_expiry TEXT,
  kyc_status  TEXT DEFAULT 'pending',  -- pending | submitted | verified | rejected
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);
```

#### profiles
```sql
CREATE TABLE profiles (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  username        TEXT UNIQUE NOT NULL,
  display_name    TEXT,
  bio             TEXT,
  avatar          TEXT,
  cover_image     TEXT,
  category        TEXT DEFAULT 'creator',
  theme_color     TEXT DEFAULT '#6366f1',
  theme_style     TEXT DEFAULT 'minimal',  -- minimal | gradient | dark | neon | glass
  status          TEXT DEFAULT 'active',   -- active | paused | suspended
  seo_title       TEXT,
  seo_desc        TEXT,
  custom_domain   TEXT,
  show_branding   INTEGER DEFAULT 1,
  total_views     INTEGER DEFAULT 0,
  total_clicks    INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);
```

#### links
```sql
CREATE TABLE links (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profiles(id),
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  icon        TEXT,
  enabled     INTEGER DEFAULT 1,
  sort_order  INTEGER DEFAULT 0,
  track_clicks INTEGER DEFAULT 1,
  clicks      INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);
```

#### digital_products
```sql
CREATE TABLE digital_products (
  id           TEXT PRIMARY KEY,
  profile_id   TEXT NOT NULL REFERENCES profiles(id),
  title        TEXT NOT NULL,
  description  TEXT,
  price        REAL NOT NULL,
  currency     TEXT DEFAULT 'INR',
  file_url     TEXT,                  -- uploaded file path
  cover_image  TEXT,
  product_type TEXT DEFAULT 'file',  -- file | link | course | template
  enabled      INTEGER DEFAULT 1,
  sales_count  INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now'))
);
```

#### social_links
```sql
CREATE TABLE social_links (
  id         TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  platform   TEXT NOT NULL,  -- instagram | youtube | twitter | linkedin | whatsapp | telegram | facebook | tiktok
  url        TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);
```

#### analytics_events
```sql
CREATE TABLE analytics_events (
  id         TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  event_type TEXT NOT NULL,  -- view | link_click | product_click | donation
  ref_id     TEXT,           -- link_id or product_id
  ip         TEXT,
  country    TEXT,
  device     TEXT,           -- mobile | desktop | tablet
  referrer   TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

#### automation_rules
```sql
CREATE TABLE automation_rules (
  id              TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL REFERENCES profiles(id),
  trigger_type    TEXT NOT NULL,  -- comment_keyword | story_reply | dm_keyword
  keywords        TEXT NOT NULL,  -- JSON array of keywords
  action_type     TEXT NOT NULL,  -- send_dm | send_reply | send_link
  message         TEXT NOT NULL,
  link_url        TEXT,
  enabled         INTEGER DEFAULT 1,
  trigger_count   INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);
```

#### instagram_config
```sql
CREATE TABLE instagram_config (
  id                    TEXT PRIMARY KEY,
  profile_id            TEXT NOT NULL REFERENCES profiles(id),
  ig_user_id            TEXT,
  ig_username           TEXT,
  access_token          TEXT,           -- long-lived token (encrypted)
  token_expires_at      TEXT,
  app_id                TEXT,
  app_secret            TEXT,           -- encrypted
  webhook_verify_token  TEXT,
  connected             INTEGER DEFAULT 0,
  created_at            TEXT DEFAULT (datetime('now')),
  updated_at            TEXT DEFAULT (datetime('now'))
);
```

#### razorpay_config
```sql
CREATE TABLE razorpay_config (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profiles(id),
  key_id      TEXT,
  key_secret  TEXT,  -- encrypted
  upi_id      TEXT,
  connected   INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);
```

#### orders
```sql
CREATE TABLE orders (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profiles(id),
  product_id  TEXT REFERENCES digital_products(id),
  buyer_name  TEXT,
  buyer_email TEXT,
  amount      REAL,
  currency    TEXT DEFAULT 'INR',
  order_type  TEXT DEFAULT 'product',  -- product | donation
  rzp_order_id TEXT,
  rzp_payment_id TEXT,
  status      TEXT DEFAULT 'pending',  -- pending | paid | failed | refunded
  created_at  TEXT DEFAULT (datetime('now'))
);
```

#### kyc_submissions
```sql
CREATE TABLE kyc_submissions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  pan         TEXT,
  aadhaar     TEXT,
  gst         TEXT,
  bank_account TEXT,
  ifsc        TEXT,
  doc_urls    TEXT,  -- JSON array of uploaded doc URLs
  status      TEXT DEFAULT 'pending',  -- pending | approved | rejected
  admin_note  TEXT,
  submitted_at TEXT DEFAULT (datetime('now')),
  reviewed_at  TEXT
);
```

---

## Low-Level Design

### 1. Authentication Flow

```
POST /api/auth/register
  Body: { email, password, name, phone }
  → Validate email uniqueness
  → Hash password (bcrypt, 12 rounds)
  → Create user record
  → Generate username from email prefix (check uniqueness, append random suffix if taken)
  → Create profile record with generated username
  → Send welcome email
  → Return: { token, user, profile }

POST /api/auth/login
  Body: { email, password }
  → Find user by email
  → Compare password hash
  → Generate JWT (payload: { userId, email, plan }, expires: 7d)
  → Return: { token, user, profile }

JWT Middleware (auth.js):
  → Extract Bearer token from Authorization header
  → Verify with JWT_SECRET
  → Attach req.user = { userId, email, plan }
  → 401 if invalid/expired
```

### 2. Public Profile Page (`/p/:username`)

```
GET /api/profiles/p/:username
  → Find profile by username WHERE status = 'active'
  → Fetch links (enabled=1, ordered by sort_order)
  → Fetch social_links
  → Fetch digital_products (enabled=1)
  → Fetch razorpay_config (key_id only, never secret)
  → Strip all sensitive fields
  → Record analytics event: type='view', device from UA
  → Return assembled profile object

Frontend rendering (SSR):
  ProfileHeader     → avatar, cover, display_name, bio, category badge
  SocialIcons       → row of social platform icons
  LinkButton[]      → each link as a styled button (theme-aware)
  ProductCard[]     → digital products with buy button
  DonationWidget    → if accept_donations enabled, show preset amounts
  InstagramFeed     → if IG connected, show last 6 posts via Meta API
  "Powered by DigiProfile" footer (removable on Pro+)
```

### 3. Instagram DM Automation

```
Setup Flow:
  1. User connects Instagram Business account via Meta OAuth
     GET /api/automation/instagram/auth-url
     → Returns Meta OAuth URL with scopes:
       instagram_basic, instagram_manage_messages,
       instagram_manage_comments, pages_messaging

  2. OAuth callback
     GET /api/automation/instagram/callback?code=...
     → Exchange code for short-lived token
     → Exchange for long-lived token (60 days)
     → Store encrypted in instagram_config
     → Subscribe page to webhooks

  3. Webhook verification
     GET /api/webhooks/meta?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
     → Verify token matches stored webhook_verify_token
     → Return hub.challenge

  4. Webhook event handler
     POST /api/webhooks/meta
     Body: Meta webhook payload (comment / DM / story reply)

     Processing logic:
       → Parse event type (comment | message | story_mention)
       → Extract text content and sender ig_user_id
       → Load automation_rules for this profile (enabled=1)
       → For each rule:
           keywords = JSON.parse(rule.keywords)
           if any keyword matches (case-insensitive) in event text:
             → Execute action:
               send_dm:   POST to Meta Graph API /me/messages
               send_reply: POST to /comment_id/replies
               send_link:  DM with link URL
             → Increment rule.trigger_count
             → Log to automation_logs table
       → Return 200 OK immediately (Meta requires fast response)

Meta API calls (services/meta.js):
  sendDM(igUserId, recipientId, message):
    POST https://graph.facebook.com/v18.0/{ig-user-id}/messages
    { recipient: { id: recipientId }, message: { text: message } }
    Authorization: Bearer {access_token}

  getRecentMedia(igUserId):
    GET https://graph.facebook.com/v18.0/{ig-user-id}/media
    ?fields=id,caption,media_type,media_url,thumbnail_url,timestamp
    &limit=6
```

### 4. Razorpay Payment Flow

```
Digital Product Purchase:
  POST /api/payments/create-order
  Body: { product_id, buyer_name, buyer_email }
  → Load product and profile razorpay_config
  → Create Razorpay order via API
  → Insert order record (status: pending)
  → Return: { order_id, amount, currency, key_id }

  Frontend: Open Razorpay checkout modal
  On success: POST /api/payments/verify
  Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  → Verify HMAC signature: SHA256(order_id + "|" + payment_id, key_secret)
  → Update order status to 'paid'
  → Increment product.sales_count
  → Send download link email to buyer
  → Return: { success, download_url }

Donation Flow:
  POST /api/payments/donate
  Body: { username, amount, donor_name, donor_message }
  → Same Razorpay order creation flow
  → order_type = 'donation'
  → No file delivery needed

Subscription Plans (platform billing):
  Plans stored in plans table:
    free:     ₹0/mo   — 5 links, no automation, no products
    pro:      ₹299/mo — unlimited links, automation, 10 products
    business: ₹799/mo — everything + custom domain + priority support

  POST /api/subscriptions/create
  → Create Razorpay subscription
  → Webhook: /api/webhooks/razorpay
    → subscription.activated → update user.plan
    → subscription.charged   → extend plan_expiry
    → subscription.cancelled → set plan = 'free'
```

### 5. Analytics Engine

```
Event recording (async, non-blocking):
  recordEvent(profileId, type, refId, req):
    → Extract IP, parse User-Agent for device type
    → Insert into analytics_events (fire-and-forget)

Dashboard aggregation queries:
  GET /api/analytics/summary?period=7d|30d|all
  → Total views (COUNT events WHERE type='view')
  → Total clicks (COUNT events WHERE type='link_click')
  → CTR = clicks / views * 100
  → Top links (GROUP BY ref_id ORDER BY count DESC LIMIT 5)
  → Views by day (GROUP BY DATE(created_at))
  → Device breakdown (GROUP BY device)
  → Top referrers (GROUP BY referrer LIMIT 5)
```

### 6. Onboarding Wizard (post-registration)

```
Step 1: Choose username
  → Real-time availability check: GET /api/profiles/check/:username
  → Debounced 400ms

Step 2: Basic profile setup
  → Display name, bio, category, avatar upload

Step 3: Add first 3 links
  → Quick-add common platforms (Instagram, YouTube, WhatsApp)

Step 4: Choose theme
  → 5 theme previews, color picker

Step 5: Connect Instagram (optional, skip available)
  → Meta OAuth button

Step 6: Done — show profile URL, copy button, share options
```

### 7. Plan Enforcement Middleware

```javascript
// planGate(feature) middleware
const PLAN_LIMITS = {
  free:     { links: 5,         products: 0,  automation: false, custom_domain: false },
  pro:      { links: Infinity,  products: 10, automation: true,  custom_domain: false },
  business: { links: Infinity,  products: Infinity, automation: true, custom_domain: true }
}

planGate('automation') → checks req.user.plan against PLAN_LIMITS
  → 403 with { error: 'upgrade_required', feature: 'automation', required_plan: 'pro' }
  → Frontend shows upgrade modal on 403
```

### 8. Key API Endpoints

```
Auth:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password

Profiles:
  GET    /api/profiles/p/:username        (public)
  GET    /api/profiles/check/:username    (public)
  GET    /api/profiles/me                 (auth)
  PUT    /api/profiles/me                 (auth)

Links:
  GET    /api/links                       (auth)
  POST   /api/links                       (auth)
  PUT    /api/links/:id                   (auth)
  DELETE /api/links/:id                   (auth)
  PUT    /api/links/reorder               (auth) — bulk sort_order update

Digital Products:
  GET    /api/products                    (auth)
  POST   /api/products                    (auth, plan: pro+)
  PUT    /api/products/:id                (auth)
  DELETE /api/products/:id                (auth)
  GET    /api/products/download/:orderId  (public, token-gated)

Analytics:
  GET    /api/analytics/summary           (auth)
  GET    /api/analytics/events            (auth)
  POST   /api/analytics/track             (public) — click tracking

Payments:
  POST   /api/payments/create-order       (public)
  POST   /api/payments/verify             (public)
  POST   /api/payments/donate             (public)
  GET    /api/payments/orders             (auth)

Automation:
  GET    /api/automation/rules            (auth, plan: pro+)
  POST   /api/automation/rules            (auth, plan: pro+)
  PUT    /api/automation/rules/:id        (auth)
  DELETE /api/automation/rules/:id        (auth)
  GET    /api/automation/instagram/auth-url (auth)
  GET    /api/automation/instagram/callback (public — OAuth redirect)
  GET    /api/automation/instagram/status  (auth)

Webhooks:
  GET    /api/webhooks/meta               (public — Meta verification)
  POST   /api/webhooks/meta               (public — Meta events)
  POST   /api/webhooks/razorpay           (public — Razorpay events)

KYC:
  POST   /api/kyc/submit                  (auth)
  GET    /api/kyc/status                  (auth)

Subscriptions:
  GET    /api/subscriptions/plans         (public)
  POST   /api/subscriptions/create        (auth)
  DELETE /api/subscriptions/cancel        (auth)
```

---

## SuperProfile-Inspired Features (Added from Analysis)

### 1. Advanced AutoDM — Multi-Trigger Automation Engine

This is the core differentiator. Based on SuperProfile's changelog and feature set:

#### Trigger Types
```
comment_keyword   → Someone comments a keyword on a Post/Reel
story_reply       → Someone replies to your Instagram Story
live_comment      → Someone comments during an Instagram Live
dm_keyword        → Someone sends a DM containing a keyword
story_mention     → Someone mentions you in their Story
post_mention      → Someone tags you in a post
link_click        → Someone clicks a specific link on your DigiProfile page
lead_magnet_download → Someone downloads a lead magnet from your profile
```

#### DM Message Formats (4 types like SuperProfile)
```
text_button   → Text message + CTA button with URL
image_video   → Image or video attachment
card          → Rich card with title, description, image, button
voice_message → Voice note (audio file)
```

#### Advanced Flow Features
```
follow_check      → Before sending DM, check if user follows you
                    If not: send "please follow first" message
                    If yes: send the main DM
email_collect     → Collect email address in DM conversation
                    Bot asks: "What's your email? I'll send it there!"
                    Stores email in leads table
follow_check + email_collect → Both enabled simultaneously (SuperProfile Nov 2025 update)
```

#### Dynamic Variables in DMs
```
<name>           → Recipient's Instagram display name
<email>          → Collected email (if email_collect enabled)
<follower_count> → Their follower count
<username>       → Their @handle
```

#### Multi-Account Support
```
Connect up to 3 Instagram accounts (Free: 1, Pro: 3, Business: 5)
Manage all automations from single dashboard
Per-account automation rules
```

#### DM Sequences (Follow-up flows)
```
automation_sequences table:
  rule_id       → parent automation rule
  step_number   → 1, 2, 3...
  delay_hours   → send after X hours
  message       → message content
  message_type  → text_button | image_video | card | voice_message

Example flow:
  Step 1 (immediate): "Hey <name>! Here's your free guide: [link]"
  Step 2 (24h later): "Did you get a chance to check it out?"
  Step 3 (72h later): "Quick question — what was most helpful?"
```

### 2. Lead Magnet System

Creators can offer free resources to capture emails directly from their profile page.

#### Lead Magnet Types
```
pdf_ebook       → Upload PDF, deliver via email after capture
checklist       → PDF checklist
template        → File download (any format)
video_access    → Unlock a video URL after email capture
discount_code   → Reveal a coupon code after email capture
webinar_access  → Register for a webinar (date/time + Zoom link)
mini_course     → Sequence of emails delivered over days
```

#### Lead Magnet Flow
```
1. Creator creates lead magnet in dashboard
   → Sets title, description, cover image
   → Uploads file OR sets URL to unlock
   → Configures email capture form fields (name, email, phone)
   → Optionally connects AutoDM: trigger DM when someone opts in

2. Lead magnet appears on public profile as a card
   → Visitor clicks "Get Free [Resource]"
   → Modal opens with email capture form
   → On submit: file download link sent to email
   → AutoDM triggered if configured
   → Lead stored in leads table

3. Creator sees all leads in dashboard
   → Name, email, phone, source, date
   → Export to CSV
   → Connect to email marketing (future: Mailchimp/ConvertKit webhook)
```

#### Database additions
```sql
CREATE TABLE lead_magnets (
  id           TEXT PRIMARY KEY,
  profile_id   TEXT NOT NULL REFERENCES profiles(id),
  title        TEXT NOT NULL,
  description  TEXT,
  cover_image  TEXT,
  magnet_type  TEXT NOT NULL,  -- pdf_ebook | checklist | template | video_access | discount_code | webinar_access
  file_url     TEXT,           -- uploaded file
  unlock_url   TEXT,           -- URL to reveal after capture
  discount_code TEXT,          -- code to reveal
  webinar_date TEXT,
  webinar_link TEXT,
  form_fields  TEXT,           -- JSON: ["name","email","phone"]
  autodm_rule_id TEXT,         -- trigger this automation on opt-in
  enabled      INTEGER DEFAULT 1,
  leads_count  INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE leads (
  id            TEXT PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profiles(id),
  magnet_id     TEXT REFERENCES lead_magnets(id),
  name          TEXT,
  email         TEXT,
  phone         TEXT,
  source        TEXT,          -- lead_magnet | autodm | manual
  ig_username   TEXT,          -- if captured via AutoDM
  created_at    TEXT DEFAULT (datetime('now'))
);
```

### 3. Webinar / Event Hosting

```
Creators can host paid or free webinars directly from their profile.

webinar_events table:
  id, profile_id, title, description, cover_image
  event_date, duration_minutes
  platform: zoom | google_meet | youtube_live | custom
  meeting_url (revealed after registration)
  price (0 = free)
  max_attendees
  registered_count
  status: upcoming | live | ended | cancelled

Registration flow:
  Free webinar  → Email capture → Send meeting link
  Paid webinar  → Razorpay payment → Send meeting link
  Reminder emails: 24h before, 1h before, at start time
```

### 4. Community / Membership

```
Creators can build a paid community (like a Telegram/WhatsApp group with access control).

communities table:
  id, profile_id, title, description, cover_image
  platform: telegram | whatsapp | discord | custom
  invite_link (revealed after payment)
  price_monthly, price_yearly
  member_count
  status: active | paused

Membership flow:
  Visitor clicks "Join Community" on profile
  → Razorpay subscription created
  → On payment: invite link revealed
  → Monthly recurring billing
  → On cancellation: access revoked
```

### 5. 1:1 Consultation Booking

```
Creators can offer paid consultation slots.

consultations table:
  id, profile_id, title, description
  duration_minutes: 15 | 30 | 60
  price
  platform: zoom | google_meet | phone | custom
  availability: JSON weekly schedule
  buffer_minutes: time between slots
  advance_booking_days: how far ahead can book

Booking flow:
  Visitor selects slot from calendar
  → Razorpay payment
  → Confirmation email with meeting link
  → Reminder 24h before
  → Creator gets notification
```

### 6. Affiliate / Partner Program

```
DigiProfile platform-level affiliate program (like SuperProfile's 50% commission).

affiliates table:
  id, user_id, referral_code, referral_url
  commission_rate: 0.30 (30% default)
  total_referrals, total_earnings, pending_payout

affiliate_conversions table:
  id, affiliate_id, referred_user_id, plan, amount, commission, status, created_at

Creator dashboard → Affiliate tab:
  → Unique referral link: digiprofile.in/ref/USERNAME
  → Stats: clicks, signups, conversions, earnings
  → Payout history
  → Request payout (min ₹500)
```

### 7. Behavioral Analytics (SuperProfile-style)

```
Beyond basic click tracking — track visitor behavior on profile page:

analytics_events additions:
  time_on_page    → seconds spent on profile
  scroll_depth    → how far they scrolled (25/50/75/100%)
  section_viewed  → which sections were visible (links/products/community)
  device_type     → mobile | desktop | tablet
  utm_source      → from Instagram bio, story, etc.

Dashboard additions:
  → Heatmap-style section engagement (which parts of profile get most attention)
  → Conversion funnel: views → link clicks → product views → purchases
  → Revenue attribution: which link/post drove the most sales
  → Audience geography (country breakdown)
  → Best performing time of day
```

### 8. AutoDM Conversation Starter (Instagram Story / Post CTA)

```
Creators can set up "Comment [KEYWORD] to get [RESOURCE]" campaigns.

Campaign builder in dashboard:
  1. Select trigger: post_comment | story_reply | reel_comment | live_comment
  2. Set keyword(s): e.g. "FREE", "GUIDE", "LINK"
  3. Set public reply (optional): "Check your DMs! 📩"
  4. Set DM content: text/image/card/voice
  5. Enable follow_check and/or email_collect
  6. Set follow-up sequence (optional)

This is the #1 use case from the YouTube video — creators post a Reel saying
"Comment FREE to get my guide" and the automation handles everything.
```

### 9. Email Marketing Integration

```
Leads captured via lead magnets and AutoDM can be synced to email platforms.

integrations table:
  id, profile_id, platform, api_key, list_id, enabled, created_at
  platform: mailchimp | convertkit | klaviyo | webhook

On new lead capture:
  → If integration enabled: POST lead data to platform API
  → Webhook option: POST to any URL (for n8n, Zapier, etc.)
```

### 10. Profile Page Enhancements

```
Additional blocks for the public profile page (beyond links):

Block types:
  link_button     → Standard link (already designed)
  product_card    → Digital product with buy button
  lead_magnet     → Free resource with email capture
  webinar_card    → Event registration card
  community_card  → Paid community join card
  consultation    → Book a call card
  youtube_embed   → Latest YouTube video
  instagram_feed  → Last 6 Instagram posts (via Meta API)
  testimonials    → Social proof carousel
  countdown_timer → Urgency timer for limited offers
  text_block      → Rich text / announcement
  divider         → Visual separator
  donation_widget → Razorpay donation with preset amounts

Drag-and-drop block ordering in dashboard.
```

---

## Updated Database Schema Additions

```sql
-- DM Sequences
CREATE TABLE automation_sequences (
  id          TEXT PRIMARY KEY,
  rule_id     TEXT NOT NULL REFERENCES automation_rules(id),
  step_number INTEGER NOT NULL,
  delay_hours INTEGER DEFAULT 0,
  message     TEXT NOT NULL,
  message_type TEXT DEFAULT 'text_button',
  button_text TEXT,
  button_url  TEXT,
  media_url   TEXT
);

-- Automation Logs
CREATE TABLE automation_logs (
  id          TEXT PRIMARY KEY,
  rule_id     TEXT NOT NULL REFERENCES automation_rules(id),
  profile_id  TEXT NOT NULL,
  ig_user_id  TEXT,
  ig_username TEXT,
  trigger_type TEXT,
  trigger_text TEXT,
  action_taken TEXT,
  status      TEXT DEFAULT 'sent',  -- sent | failed | skipped
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Lead Magnets (see above)
-- Leads (see above)

-- Webinar Events
CREATE TABLE webinar_events (
  id              TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL REFERENCES profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  cover_image     TEXT,
  event_date      TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  platform        TEXT DEFAULT 'zoom',
  meeting_url     TEXT,
  price           REAL DEFAULT 0,
  max_attendees   INTEGER,
  registered_count INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'upcoming',
  created_at      TEXT DEFAULT (datetime('now'))
);

-- Communities
CREATE TABLE communities (
  id            TEXT PRIMARY KEY,
  profile_id    TEXT NOT NULL REFERENCES profiles(id),
  title         TEXT NOT NULL,
  description   TEXT,
  cover_image   TEXT,
  platform      TEXT DEFAULT 'telegram',
  invite_link   TEXT,
  price_monthly REAL DEFAULT 0,
  price_yearly  REAL DEFAULT 0,
  member_count  INTEGER DEFAULT 0,
  status        TEXT DEFAULT 'active',
  created_at    TEXT DEFAULT (datetime('now'))
);

-- Consultations
CREATE TABLE consultations (
  id                  TEXT PRIMARY KEY,
  profile_id          TEXT NOT NULL REFERENCES profiles(id),
  title               TEXT NOT NULL,
  description         TEXT,
  duration_minutes    INTEGER DEFAULT 30,
  price               REAL NOT NULL,
  platform            TEXT DEFAULT 'zoom',
  availability        TEXT,  -- JSON weekly schedule
  buffer_minutes      INTEGER DEFAULT 15,
  advance_booking_days INTEGER DEFAULT 30,
  enabled             INTEGER DEFAULT 1,
  created_at          TEXT DEFAULT (datetime('now'))
);

-- Affiliates
CREATE TABLE affiliates (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  referral_code   TEXT UNIQUE NOT NULL,
  commission_rate REAL DEFAULT 0.30,
  total_referrals INTEGER DEFAULT 0,
  total_earnings  REAL DEFAULT 0,
  pending_payout  REAL DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- Profile Blocks (for drag-and-drop profile builder)
CREATE TABLE profile_blocks (
  id         TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  block_type TEXT NOT NULL,  -- link_button | product_card | lead_magnet | webinar_card | community_card | consultation | youtube_embed | instagram_feed | testimonials | countdown_timer | text_block | divider | donation_widget
  ref_id     TEXT,           -- id of the linked entity (product_id, magnet_id, etc.)
  config     TEXT,           -- JSON config for the block
  sort_order INTEGER DEFAULT 0,
  enabled    INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

### 11. AI Content Generation Studio

Creators can generate Instagram post images and captions using their own AI API keys. The platform provides the interface, prompt templates, and base assets — the creator brings their own key (Gemini or OpenRouter free models).

#### Architecture

```
Creator Dashboard → AI Studio page
  ↓
POST /api/ai/generate
  ↓
Backend: validate feature access (admin toggle + subscription)
  ↓
Decrypt creator's stored API key
  ↓
Route to provider:
  Gemini API  → gemini-2.0-flash (text) + imagen-3 (image)
  OpenRouter  → free models: meta-llama/llama-3.1-8b (text)
                              stabilityai/stable-diffusion (image)
  ↓
Return generated content to frontend
  ↓
Creator previews, edits, saves to media library or downloads
```

#### Feature Access Control (3-layer)

```
Layer 1 — Admin toggle (per user):
  admin_ai_access table:
    user_id, enabled (0/1), trial_generations_used, trial_limit (default 2), notes

Layer 2 — Subscription plan:
  Free:    AI Studio disabled (must upgrade)
  Creator: AI Studio enabled (uses own API key, unlimited with key)
  Pro:     AI Studio enabled (uses own API key, unlimited with key)
  Trial:   2 free generations (no API key needed, uses platform key)

Layer 3 — API key:
  User must add their own Gemini or OpenRouter key to use beyond trial
  Key stored AES-256 encrypted in ai_config table
```

#### Generation Types

```
1. Instagram Post Image
   Input:  product name, description, style, color palette, base image (optional)
   Output: 1080×1080px image (square post format)
   Model:  Gemini imagen-3 or Stable Diffusion via OpenRouter

2. Instagram Caption + Hashtags
   Input:  product name, tone (professional/casual/hype), target audience, CTA
   Output: caption text (max 2200 chars) + 30 relevant hashtags
   Model:  Gemini Flash or Llama 3.1 via OpenRouter

3. Instagram Story Image
   Input:  product name, style, text overlay content
   Output: 1080×1920px image (story format)
   Model:  Same as post image

4. Combined (Image + Caption)
   Generates both in one request
```

#### Prompt Template System

```
ai_prompt_templates table:
  id, profile_id (NULL = platform default), title, category
  image_prompt    → template string with {{variables}}
  caption_prompt  → template string with {{variables}}
  variables       → JSON array of variable names
  preview_image   → example output image URL
  is_platform     → 1 = created by admin, 0 = user-created
  enabled         → 1/0
  created_at

Platform provides pre-built templates:
  - "Digital Product Launch"     → product promo style
  - "Free Resource Giveaway"     → lead magnet style
  - "Webinar Announcement"       → event promo style
  - "Testimonial Post"           → social proof style
  - "Behind the Scenes"          → personal brand style
  - "Course Promotion"           → education style

User can:
  - Browse platform templates with preview images
  - Use a template (variables auto-filled from their product data)
  - Save their own custom templates
  - Edit/delete their saved templates
```

#### Base Image / Background Library

```
ai_base_images table:
  id, profile_id (NULL = platform), title, category
  image_url, thumbnail_url
  is_platform → 1 = admin uploaded, 0 = user uploaded
  tags        → JSON array

Platform provides base backgrounds:
  - Gradient sets (10 colors)
  - Minimal white/dark backgrounds
  - Texture backgrounds (paper, fabric, etc.)
  - Product mockup frames (phone, laptop, book)

User can:
  - Browse and select a base image/background
  - Upload their own base images (stored in uploads/ai-bases/)
  - Use their product's cover image as base
```

#### Generation History & Media Library

```
ai_generations table:
  id, user_id, profile_id
  generation_type   → post_image | caption | story_image | combined
  provider          → gemini | openrouter
  model_used        → model name
  prompt_used       → final prompt sent to API
  template_id       → if template was used
  result_image_url  → saved output image
  result_caption    → generated caption text
  result_hashtags   → generated hashtags
  status            → pending | completed | failed
  error_message     → if failed
  created_at

Creator can:
  - View all past generations in a gallery
  - Re-generate with same or modified prompt
  - Download generated image
  - Copy caption + hashtags
  - Save to profile media library for use in posts
```

#### Admin Panel Controls

```
In digikraft admin panel → DigiProfile section → AI Studio tab:

Per-user controls:
  - Enable/disable AI Studio for specific user
  - Set trial generation limit (default 2)
  - View trial usage count
  - Reset trial count
  - Add admin note

Platform template management:
  - Upload new platform prompt templates
  - Upload new base images/backgrounds
  - Enable/disable templates globally

Usage monitoring:
  - Total generations per day/week
  - Provider breakdown (Gemini vs OpenRouter)
  - Failed generation rate
  - Users who have added API keys
```

#### API Key Management

```
ai_config table:
  id, user_id
  gemini_api_key    → AES-256 encrypted
  openrouter_api_key → AES-256 encrypted
  preferred_provider → gemini | openrouter
  trial_used        → integer (incremented per trial generation)
  created_at, updated_at

Key validation on save:
  Gemini:     GET https://generativelanguage.googleapis.com/v1/models
              with provided key — must return 200
  OpenRouter: GET https://openrouter.ai/api/v1/models
              with provided key — must return 200
```

#### Low-Level: Generation Flow

```javascript
POST /api/ai/generate
Body: {
  type: 'post_image' | 'caption' | 'story_image' | 'combined',
  product_id: optional,        // auto-fill product details
  template_id: optional,       // use a prompt template
  custom_prompt: optional,     // override template
  base_image_id: optional,     // background/base image
  variables: {                 // template variable values
    product_name, description, tone, cta, color_palette, style
  }
}

Processing:
  1. Check admin_ai_access.enabled for this user → 403 if disabled
  2. Check subscription plan → 403 if Free (no trial exhausted)
  3. If trial mode: check trial_used < trial_limit → 403 if exhausted
  4. Load ai_config for user → get provider + decrypt key
  5. If trial mode: use platform's own API key (env var)
  6. Build final prompt from template + variables
  7. Call provider API (async, timeout 30s)
  8. Save result to ai_generations table
  9. If trial: increment trial_used
  10. Return { image_url, caption, hashtags, generation_id }

Error handling:
  - API key invalid → 400 with 'invalid_api_key'
  - Provider rate limit → 429 with 'provider_rate_limit'
  - Generation failed → 500 with error saved to ai_generations
  - Trial exhausted → 403 with 'trial_exhausted', show upgrade CTA
```

---

## Updated API Endpoints

```
Lead Magnets:
  GET    /api/lead-magnets                (auth)
  POST   /api/lead-magnets                (auth)
  PUT    /api/lead-magnets/:id            (auth)
  DELETE /api/lead-magnets/:id            (auth)
  POST   /api/lead-magnets/:id/capture    (public) — email capture form submit

Leads:
  GET    /api/leads                       (auth)
  GET    /api/leads/export                (auth) — CSV download

Webinars:
  GET    /api/webinars                    (auth)
  POST   /api/webinars                    (auth, plan: pro+)
  PUT    /api/webinars/:id                (auth)
  DELETE /api/webinars/:id                (auth)
  POST   /api/webinars/:id/register       (public)

Communities:
  GET    /api/communities                 (auth)
  POST   /api/communities                 (auth, plan: pro+)
  PUT    /api/communities/:id             (auth)
  POST   /api/communities/:id/join        (public)

Consultations:
  GET    /api/consultations               (auth)
  POST   /api/consultations               (auth, plan: pro+)
  GET    /api/consultations/:id/slots     (public) — available slots
  POST   /api/consultations/:id/book      (public)

Affiliates:
  GET    /api/affiliates/me               (auth)
  POST   /api/affiliates/join             (auth)
  GET    /api/affiliates/stats            (auth)
  POST   /api/affiliates/payout           (auth)

Profile Blocks:
  GET    /api/blocks                      (auth)
  POST   /api/blocks                      (auth)
  PUT    /api/blocks/:id                  (auth)
  DELETE /api/blocks/:id                  (auth)
  PUT    /api/blocks/reorder              (auth) — bulk sort_order

AutoDM Sequences:
  GET    /api/automation/rules/:id/sequences  (auth)
  POST   /api/automation/rules/:id/sequences  (auth)
  PUT    /api/automation/sequences/:id        (auth)
  DELETE /api/automation/sequences/:id        (auth)
  GET    /api/automation/logs                 (auth)
```

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Nuxt.js 3 (Vue 3) | Matches digikraft stack, SSR for public profiles |
| Styling | Tailwind CSS | Rapid UI, mobile-first |
| Backend | Node.js + Express | Matches digikraft backend |
| Database | SQLite (better-sqlite3) | Simple, file-based, no extra infra |
| Auth | JWT + bcrypt | Stateless, simple |
| Payments | Razorpay | India-first, supports subscriptions |
| Meta API | Meta Graph API v18 | Instagram DM automation |
| File Storage | Local uploads (Multer) → Cloudinary (prod) | Simple dev, scalable prod |
| Email | Nodemailer + Gmail SMTP | Transactional emails |
| Port (frontend) | 4001 | Separate from digikraft ports |
| Port (backend) | 4000 | Separate from digikraft ports |

---

## Subscription Plans

| Feature | Free | Creator (₹299/mo) | Pro (₹799/mo) |
|---|---|---|---|
| Links | 5 | Unlimited | Unlimited |
| Digital Products | 0 | 10 | Unlimited |
| Lead Magnets | 1 | 5 | Unlimited |
| Webinars | ✗ | 2/mo | Unlimited |
| Communities | ✗ | 1 | Unlimited |
| Consultations | ✗ | ✓ | ✓ |
| Instagram AutoDM | ✗ | ✓ (1 account) | ✓ (5 accounts) |
| DM Sequences | ✗ | 3 steps | Unlimited |
| Follow Check + Email Collect | ✗ | ✓ | ✓ |
| DM Formats | ✗ | Text + Image | All 4 types |
| Razorpay Payments | ✗ | ✓ | ✓ |
| Analytics | Basic views | Full + device | Full + export + revenue |
| Affiliate Program | ✗ | ✓ | ✓ |
| Custom Domain | ✗ | ✗ | ✓ |
| Remove Branding | ✗ | ✓ | ✓ |
| Email Integrations | ✗ | Webhook | All platforms |
| Priority Support | ✗ | ✗ | ✓ |

---

## Security Considerations

- Passwords: bcrypt with 12 salt rounds
- JWT secret: env variable, never hardcoded
- Razorpay key_secret: AES-256 encrypted at rest in DB
- Instagram access_token: AES-256 encrypted at rest
- Meta webhook: verify token + signature validation on every event
- Razorpay webhook: HMAC signature verification
- File uploads: type validation (PDF, ZIP, images only), size limit 50MB
- Rate limiting: 100 req/min per IP on public routes, 300 req/min on auth routes
- CORS: whitelist digiprofile domain only
- SQL injection: parameterized queries only (better-sqlite3 prepared statements)


---

## AI Studio — Additional API Endpoints

```
User-facing:
  GET    /api/ai/config                       (auth)
  PUT    /api/ai/config                       (auth)
  POST   /api/ai/validate-key                 (auth)
  POST   /api/ai/generate                     (auth)
  GET    /api/ai/generations                  (auth)
  DELETE /api/ai/generations/:id              (auth)
  GET    /api/ai/templates                    (auth)
  POST   /api/ai/templates                    (auth)
  PUT    /api/ai/templates/:id                (auth)
  DELETE /api/ai/templates/:id                (auth)
  GET    /api/ai/base-images                  (auth)
  POST   /api/ai/base-images                  (auth)
  DELETE /api/ai/base-images/:id              (auth)

Admin:
  GET    /api/admin/ai/users                  (admin)
  PUT    /api/admin/ai/users/:userId          (admin)
  GET    /api/admin/ai/stats                  (admin)
  POST   /api/admin/ai/templates              (admin)
  PUT    /api/admin/ai/templates/:id          (admin)
  DELETE /api/admin/ai/templates/:id          (admin)
  POST   /api/admin/ai/base-images            (admin)
  DELETE /api/admin/ai/base-images/:id        (admin)
```
