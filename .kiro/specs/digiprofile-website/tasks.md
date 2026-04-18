# Implementation Tasks: DigiProfile Website

## Phase 1: Project Foundation & Backend Core

- [x] 1. Initialize project structure
  - [x] 1.1 Create `digiprofile/` folder at workspace root with `backend/` and `frontend/` subdirectories
  - [x] 1.2 Initialize Node.js/Express backend (`package.json`, `server.js`, folder structure: routes, middleware, services, db, uploads)
  - [x] 1.3 Initialize Nuxt.js 3 frontend with Tailwind CSS (`nuxt.config.ts` with devServer port 4001)
  - [x] 1.4 Create `.env.example` files for both backend and frontend with all required environment variables
  - [x] 1.5 Create `README.md` with setup instructions, port assignments, and start commands

- [x] 2. Database setup (SQLite)
  - [x] 2.1 Install `better-sqlite3` and create `db/database.js` with connection, helper functions (`dbRun`, `dbGet`, `dbAll`), and graceful shutdown
  - [x] 2.2 Create migration system: `db/migrations/` folder with numbered SQL files and a migration runner
  - [x] 2.3 Write migration `001_initial_schema.sql` — create all core tables: `users`, `profiles`, `links`, `social_links`, `digital_products`, `analytics_events`, `orders`, `kyc_submissions`
  - [x] 2.4 Write migration `002_automation.sql` — create: `automation_rules`, `automation_sequences`, `automation_logs`, `instagram_config`, `razorpay_config`
  - [x] 2.5 Write migration `003_monetization.sql` — create: `lead_magnets`, `leads`, `webinar_events`, `webinar_registrations`, `communities`, `community_members`, `consultations`, `consultation_bookings`
  - [x] 2.6 Write migration `004_platform.sql` — create: `affiliates`, `affiliate_conversions`, `profile_blocks`, `subscriptions`, `email_queue`
  - [x] 2.7 Run all migrations on startup and verify schema integrity

- [x] 3. Authentication system (backend)
  - [x] 3.1 Install `bcryptjs`, `jsonwebtoken`, `nodemailer`; create `middleware/auth.js` with `requireAuth` and `requirePlan(plan)` middleware
  - [x] 3.2 Create `services/email.js` with Nodemailer SMTP setup and `sendEmail(to, subject, html)` helper
  - [x] 3.3 Create `services/crypto.js` with AES-256-GCM `encrypt(text)` and `decrypt(ciphertext)` helpers for storing secrets
  - [x] 3.4 Implement `POST /api/auth/register` — validate input, check email uniqueness, hash password, create user + profile, send welcome email, return JWT
  - [x] 3.5 Implement `POST /api/auth/login` — validate credentials, compare bcrypt hash, return JWT with user + profile data
  - [x] 3.6 Implement `POST /api/auth/forgot-password` — generate single-use reset token (1h expiry), store hashed token, send reset email
  - [x] 3.7 Implement `POST /api/auth/reset-password` — validate token, hash new password, invalidate token
  - [x] 3.8 Implement `GET /api/auth/me` and `PUT /api/auth/me` — return/update current user details
  - [x] 3.9 Add rate limiting middleware (`express-rate-limit`): 100 req/min public, 300 req/min authenticated

- [x] 4. Profile API (backend)
  - [x] 4.1 Implement `GET /api/profiles/check/:username` — return availability status
  - [x] 4.2 Implement `GET /api/profiles/me` — return full profile for authenticated user
  - [x] 4.3 Implement `PUT /api/profiles/me` — update profile fields, validate username uniqueness on change
  - [x] 4.4 Implement `GET /api/profiles/p/:username` — public profile fetch, increment view count, strip sensitive fields, record analytics event
  - [x] 4.5 Add plan enforcement middleware factory `planGate(feature)` that checks `req.user.plan` against `PLAN_LIMITS` config

---

## Phase 2: Frontend Foundation & Auth

- [ ] 5. Frontend base setup
  - [ ] 5.1 Configure Nuxt.js: Tailwind CSS, Pinia stores, `@nuxtjs/color-mode`, axios/ofetch composable, global error handling
  - [ ] 5.2 Create `stores/auth.ts` — user state, login/register/logout actions, JWT persistence in localStorage, auto-refresh on app load
  - [ ] 5.3 Create `middleware/auth.ts` — redirect unauthenticated users away from `/dashboard/*` routes
  - [ ] 5.4 Create `middleware/plan.ts` — redirect users to upgrade page on 403 `upgrade_required` responses
  - [ ] 5.5 Create shared layout components: `AppHeader.vue` (marketing nav), `DashboardSidebar.vue` (creator nav with plan badge), `AppFooter.vue`

- [ ] 6. Auth pages (frontend)
  - [ ] 6.1 Build `pages/register.vue` — email, password, name, phone form with validation, calls register API, redirects to onboarding
  - [ ] 6.2 Build `pages/login.vue` — email + password form, JWT storage, redirect to dashboard
  - [ ] 6.3 Build `pages/forgot-password.vue` and `pages/reset-password.vue` — password reset flow
  - [ ] 6.4 Build upgrade modal component `components/shared/UpgradeModal.vue` — shown on 403 `upgrade_required`, displays plan comparison

- [ ] 7. Onboarding wizard
  - [ ] 7.1 Build `pages/onboarding.vue` — 6-step wizard with step indicator and skip functionality
  - [ ] 7.2 Step 1: Username picker with real-time availability check (debounced 400ms)
  - [ ] 7.3 Step 2: Basic profile — display name, bio, category, avatar upload
  - [ ] 7.4 Step 3: Add first 3 links — quick-add buttons for Instagram, YouTube, WhatsApp + custom link
  - [ ] 7.5 Step 4: Theme picker — 5 theme style cards + color picker with live mini-preview
  - [ ] 7.6 Step 5: Instagram connect — Meta OAuth button (optional, skip available)
  - [ ] 7.7 Step 6: Completion screen — show profile URL, copy button, "View my profile" and "Go to dashboard" CTAs

---

## Phase 3: Dashboard — Profile & Links

- [ ] 8. Dashboard shell
  - [ ] 8.1 Build `pages/dashboard/index.vue` — stats overview: total views, clicks, CTR, earnings (last 7 days), quick action cards
  - [ ] 8.2 Build `pages/dashboard/appearance.vue` — profile editor: avatar/cover upload, bio, theme style + color picker, live mobile preview panel
  - [ ] 8.3 Create `components/dashboard/ThemePreview.vue` — renders a scaled-down mobile mockup of the profile in real time

- [ ] 9. Link manager
  - [ ] 9.1 Implement `GET/POST/PUT/DELETE /api/links` and `PUT /api/links/reorder` backend routes
  - [ ] 9.2 Build `pages/dashboard/links.vue` — drag-and-drop link list (use `@vueuse/core` useSortable or `vue-draggable-plus`)
  - [ ] 9.3 Each link row: title input, URL input, icon picker, enabled toggle, click count badge, delete button
  - [ ] 9.4 Show plan limit warning when Free user has 5 links and tries to add more

- [ ] 10. Profile block builder
  - [ ] 10.1 Implement `GET/POST/PUT/DELETE /api/blocks` and `PUT /api/blocks/reorder` backend routes
  - [ ] 10.2 Build `pages/dashboard/builder.vue` — left panel: block type picker; center: drag-and-drop block list; right: live profile preview
  - [ ] 10.3 Implement block config panels for each block type (link_button, text_block, divider, donation_widget, youtube_embed, testimonials, countdown_timer)
  - [ ] 10.4 Implement block config panels for entity-linked blocks (product_card, lead_magnet, webinar_card, community_card, consultation) — show picker to select existing entity

---

## Phase 4: Public Profile Page

- [ ] 11. Public profile page (SSR)
  - [ ] 11.1 Build `pages/p/[username].vue` — SSR page using `useAsyncData` to fetch profile from API
  - [ ] 11.2 Add Open Graph meta tags: title, description, og:image (cover or avatar), og:url
  - [ ] 11.3 Build `components/profile/ProfileHeader.vue` — cover image, avatar, display name, bio, category badge, verified badge
  - [ ] 11.4 Build `components/profile/SocialIcons.vue` — row of social platform icon links
  - [ ] 11.5 Build `components/profile/LinkButton.vue` — styled CTA button, theme-aware (5 theme styles), click tracking on click
  - [ ] 11.6 Build `components/profile/DonationWidget.vue` — preset amount buttons + custom amount, Razorpay checkout integration
  - [ ] 11.7 Build `components/profile/InstagramFeed.vue` — 6-post grid fetched from Meta API via backend proxy
  - [ ] 11.8 Build `components/profile/ProductCard.vue` — product image, title, price, "Buy Now" button triggering Razorpay
  - [ ] 11.9 Build `components/profile/LeadMagnetCard.vue` — cover, title, description, "Get Free [Resource]" button opening email capture modal
  - [ ] 11.10 Build `components/profile/WebinarCard.vue` — event date/time, title, price badge, "Register" button
  - [ ] 11.11 Build `components/profile/CommunityCard.vue` — platform icon, title, price, "Join" button
  - [ ] 11.12 Build `components/profile/ConsultationCard.vue` — duration, price, "Book a Call" button opening slot picker
  - [ ] 11.13 Build `components/profile/CountdownTimer.vue` — live countdown to a target date/time
  - [ ] 11.14 Apply theme styles (minimal/gradient/dark/neon/glass) as CSS classes on the profile wrapper
  - [ ] 11.15 Add "Powered by DigiProfile" footer link (hidden for Creator+ plans)

---

## Phase 5: Digital Products & Payments

- [ ] 12. Digital products (backend)
  - [ ] 12.1 Install `multer`; create `middleware/upload.js` with MIME type validation (PDF, ZIP, JPEG, PNG, MP4) and 50MB size limit
  - [ ] 12.2 Implement `GET/POST/PUT/DELETE /api/products` with plan limit enforcement (Creator: 10, Pro: unlimited)
  - [ ] 12.3 Implement `GET /api/products/download/:orderId` — validate order token, check expiry + single-use, serve file or redirect to URL

- [ ] 13. Razorpay integration (backend)
  - [ ] 13.1 Create `services/razorpay.js` — Razorpay SDK wrapper with `createOrder`, `verifyPayment`, `createSubscription` methods
  - [ ] 13.2 Implement `POST /api/payments/create-order` — create Razorpay order for product/donation/webinar/consultation
  - [ ] 13.3 Implement `POST /api/payments/verify` — HMAC-SHA256 signature verification, update order status, trigger delivery
  - [ ] 13.4 Implement `POST /api/payments/donate` — donation order creation
  - [ ] 13.5 Implement `GET /api/payments/orders` — list orders for authenticated creator
  - [ ] 13.6 Implement `POST /api/webhooks/razorpay` — handle subscription events: activated, charged, cancelled, payment_failed

- [ ] 14. Digital products (frontend)
  - [ ] 14.1 Build `pages/dashboard/products.vue` — product list with create/edit/delete, sales count, revenue per product
  - [ ] 14.2 Build product create/edit form: title, description, price, product type selector, file upload zone, cover image upload
  - [ ] 14.3 Integrate Razorpay checkout on public profile product cards — load Razorpay script, open checkout modal, call verify endpoint on success

---

## Phase 6: Lead Magnets & Leads

- [ ] 15. Lead magnet system (backend)
  - [ ] 15.1 Implement `GET/POST/PUT/DELETE /api/lead-magnets` with plan limits
  - [ ] 15.2 Implement `POST /api/lead-magnets/:id/capture` — validate email, deduplicate, store lead, send delivery email, trigger AutoDM if configured
  - [ ] 15.3 Implement `GET /api/leads` and `GET /api/leads/export` (CSV download)

- [ ] 16. Lead magnet system (frontend)
  - [ ] 16.1 Build `pages/dashboard/leads.vue` — lead magnet manager + leads table with search, filter by magnet, CSV export button
  - [ ] 16.2 Build lead magnet create/edit form: type selector, title, description, cover image, file upload or URL, form field configurator, AutoDM rule picker
  - [ ] 16.3 Build `components/profile/LeadMagnetModal.vue` — email capture modal shown when visitor clicks a lead magnet card on public profile

---

## Phase 7: Instagram AutoDM Automation

- [ ] 17. Meta API integration (backend)
  - [ ] 17.1 Create `services/meta.js` — Meta Graph API client: `exchangeCodeForToken`, `getLongLivedToken`, `subscribeToWebhooks`, `sendDM`, `sendCommentReply`, `getRecentMedia`, `getUserInfo`
  - [ ] 17.2 Implement `GET /api/automation/instagram/auth-url` — generate Meta OAuth URL with required scopes
  - [ ] 17.3 Implement `GET /api/automation/instagram/callback` — exchange code for long-lived token, encrypt and store, subscribe to webhooks
  - [ ] 17.4 Implement `GET /api/automation/instagram/status` — return connection status and token expiry
  - [ ] 17.5 Implement `GET /api/webhooks/meta` — webhook verification (return hub.challenge)
  - [ ] 17.6 Implement `POST /api/webhooks/meta` — parse event type, match against automation rules, execute actions, log results, respond 200 within 200ms
  - [ ] 17.7 Add deduplication: store processed Meta event IDs in `processed_events` table, skip duplicates

- [ ] 18. Automation rules (backend)
  - [ ] 18.1 Implement `GET/POST/PUT/DELETE /api/automation/rules` with plan enforcement (Creator+)
  - [ ] 18.2 Implement `GET/POST/PUT/DELETE /api/automation/rules/:id/sequences` — DM follow-up steps
  - [ ] 18.3 Implement `GET /api/automation/logs` — paginated automation trigger log
  - [ ] 18.4 Build keyword matching engine: case-insensitive, supports multiple keywords per rule, partial word match option

- [ ] 19. Automation dashboard (frontend)
  - [ ] 19.1 Build `pages/dashboard/automation.vue` — Instagram connection status card + automation rules list
  - [ ] 19.2 Build automation rule create/edit form: trigger type selector, keywords input (tag-style), DM format selector (text/image/card/voice), message composer with dynamic variable hints
  - [ ] 19.3 Build Follow Check toggle and Email Collect toggle with combined mode support
  - [ ] 19.4 Build DM sequence builder — add/remove/reorder steps, set delay per step
  - [ ] 19.5 Build automation logs table — trigger time, sender, action, status, with filter by rule
  - [ ] 19.6 Show upgrade prompt for Free plan users with feature preview

---

## Phase 8: Webinars, Communities & Consultations

- [ ] 20. Webinars (backend + frontend)
  - [ ] 20.1 Implement `GET/POST/PUT/DELETE /api/webinars` and `POST /api/webinars/:id/register` with plan limits
  - [ ] 20.2 Build email reminder job — scan upcoming webinars, send 24h and 1h reminder emails (use `node-cron`)
  - [ ] 20.3 Build `pages/dashboard/webinars.vue` — webinar list with registrant count, status badge, edit/delete
  - [ ] 20.4 Build webinar create/edit form: title, description, cover, date/time picker, platform selector, meeting URL, price, max attendees

- [ ] 21. Communities (backend + frontend)
  - [ ] 21.1 Implement `GET/POST/PUT/DELETE /api/communities` and `POST /api/communities/:id/join` with Razorpay subscription creation
  - [ ] 21.2 Build `pages/dashboard/communities.vue` — community list with member count, revenue, edit/delete
  - [ ] 21.3 Build community create/edit form: title, description, platform selector, invite link (hidden until saved), pricing

- [ ] 22. Consultations (backend + frontend)
  - [ ] 22.1 Implement `GET/POST/PUT/DELETE /api/consultations`, `GET /api/consultations/:id/slots`, `POST /api/consultations/:id/book`
  - [ ] 22.2 Build slot availability calculator — generate available slots from weekly schedule, exclude booked slots and buffer time
  - [ ] 22.3 Build `pages/dashboard/consultations.vue` — consultation list with booking count, upcoming sessions
  - [ ] 22.4 Build `components/profile/SlotPicker.vue` — calendar + time slot grid for public profile booking flow

---

## Phase 9: Analytics

- [ ] 23. Analytics (backend)
  - [ ] 23.1 Create `services/analytics.js` — `recordEvent(profileId, type, refId, req)` async helper (fire-and-forget, never throws)
  - [ ] 23.2 Implement `GET /api/analytics/summary` — aggregate queries for views, clicks, CTR, top links, views by day, device breakdown, top referrers; support `?period=7d|30d|all`
  - [ ] 23.3 Implement `POST /api/analytics/track` — public endpoint for client-side click tracking
  - [ ] 23.4 Implement `GET /api/analytics/events` — paginated raw events for Pro plan
  - [ ] 23.5 Implement `GET /api/analytics/export` — CSV export for Pro plan

- [ ] 24. Analytics dashboard (frontend)
  - [ ] 24.1 Build `pages/dashboard/analytics.vue` — stats cards (views, clicks, CTR, earnings), period selector tabs
  - [ ] 24.2 Build `components/dashboard/ViewsChart.vue` — line chart of views by day (use Chart.js or lightweight alternative)
  - [ ] 24.3 Build top links table, device breakdown pie chart, top referrers list
  - [ ] 24.4 Add CSV export button (Pro plan only, show upgrade prompt otherwise)

---

## Phase 10: KYC, Subscriptions & Affiliate

- [ ] 25. KYC system
  - [ ] 25.1 Implement `POST /api/kyc/submit` — accept form data + document uploads, store encrypted, set status to 'submitted'
  - [ ] 25.2 Implement `GET /api/kyc/status` — return current KYC status and admin note
  - [ ] 25.3 Build `pages/dashboard/kyc.vue` — KYC submission form: PAN, Aadhaar, GST, bank details, document upload zones, status display
  - [ ] 25.4 Add KYC gate to payment-related API routes — return 403 with `kyc_required` if status != 'verified'

- [ ] 26. Platform subscriptions
  - [ ] 26.1 Implement `GET /api/subscriptions/plans` — return plan definitions with features and pricing
  - [ ] 26.2 Implement `POST /api/subscriptions/create` — create Razorpay subscription for platform billing
  - [ ] 26.3 Implement `DELETE /api/subscriptions/cancel` — cancel subscription, schedule downgrade at period end
  - [ ] 26.4 Build `pages/pricing.vue` — plan comparison table with monthly/yearly toggle, "Get Started" CTAs
  - [ ] 26.5 Build `pages/dashboard/settings.vue` — current plan display, upgrade/downgrade buttons, billing history

- [ ] 27. Affiliate program
  - [ ] 27.1 Implement `POST /api/affiliates/join`, `GET /api/affiliates/me`, `GET /api/affiliates/stats`, `POST /api/affiliates/payout`
  - [ ] 27.2 Add referral tracking middleware — detect `/ref/:code` visits, store referral cookie (30-day expiry)
  - [ ] 27.3 On new user registration, check for referral cookie and store attribution in `affiliate_conversions`
  - [ ] 27.4 On subscription payment webhook, credit commission to affiliate (30% of payment amount)
  - [ ] 27.5 Build `pages/dashboard/affiliate.vue` — referral link display, stats cards, conversion table, payout request button

---

## Phase 11: Marketing Site & Polish

- [ ] 28. Marketing pages
  - [ ] 28.1 Build `pages/index.vue` — hero section (headline, subheadline, CTA, profile mockup), features section (AutoDM, products, analytics), social proof (creator count, testimonials), pricing preview, footer
  - [ ] 28.2 Build `pages/pricing.vue` — full plan comparison table with feature checklist per plan, FAQ section
  - [ ] 28.3 Build `pages/features/auto-dm.vue` — AutoDM feature landing page with trigger type examples
  - [ ] 28.4 Add `pages/terms.vue` and `pages/privacy.vue` — legal pages

- [ ] 29. Security hardening
  - [ ] 29.1 Add `helmet` middleware to Express for security headers
  - [ ] 29.2 Add CORS configuration — whitelist only DigiProfile frontend domain
  - [ ] 29.3 Audit all API responses — ensure no route returns `key_secret`, `access_token`, `password`, or `kyc_documents` fields
  - [ ] 29.4 Add `X-Hub-Signature-256` verification to Meta webhook handler
  - [ ] 29.5 Add Razorpay webhook signature verification
  - [ ] 29.6 Add input sanitization middleware (`express-validator`) on all POST/PUT routes

- [ ] 30. Email system completion
  - [ ] 30.1 Build email templates (HTML) for: welcome, password reset, KYC status change, order confirmation, lead magnet delivery, webinar reminder, consultation reminder, subscription renewal/cancellation, Instagram token expiry warning
  - [ ] 30.2 Implement async email queue using `email_queue` table — worker polls every 30 seconds, retries failed sends up to 3 times
  - [ ] 30.3 Test all email flows end-to-end

- [ ] 31. Final integration & testing
  - [ ] 31.1 Write property-based tests for: payment signature verification (any tampered payload must fail), username uniqueness (concurrent registrations must not create duplicates), plan limit enforcement (no route bypasses limits), download token expiry (expired tokens always rejected)
  - [ ] 31.2 End-to-end test the full creator journey: register → onboard → add links → create product → connect Instagram → set up AutoDM → view analytics
  - [ ] 31.3 Test public profile page on mobile (320px, 375px, 414px viewports)
  - [ ] 31.4 Create `digiprofile/START.md` with complete setup guide: env vars, running backend (port 4000), running frontend (port 4001), Meta app setup, Razorpay setup


---

## Phase 12: AI Content Generation Studio

- [ ] 32. AI Studio database & backend foundation
  - [ ] 32.1 Write migration `005_ai_studio.sql` — create tables: `ai_config` (user API keys, trial tracking), `ai_prompt_templates` (platform + user templates with variables JSON), `ai_base_images` (platform + user backgrounds), `ai_generations` (history with prompt, result URLs, status), `admin_ai_access` (per-user enable toggle, trial limit, trial used count)
  - [ ] 32.2 Create `services/ai-providers.js` — provider abstraction with two implementations:
    - `GeminiProvider`: text via `gemini-2.0-flash`, image via `imagen-3` (Google AI SDK)
    - `OpenRouterProvider`: text via `meta-llama/llama-3.1-8b-instruct:free`, image via `stabilityai/stable-diffusion-xl-base-1.0` (OpenRouter REST API)
    - Both implement `generateText(prompt, options)` and `generateImage(prompt, size, options)`
  - [ ] 32.3 Create `services/ai-studio.js` — orchestration service: `buildPrompt(template, variables)`, `routeToProvider(userId)` (decrypt key, select provider), `recordGeneration(userId, data)`, `checkAccess(userId)` (admin toggle + trial check)
  - [ ] 32.4 Implement `GET/PUT /api/ai/config` — get masked config, save encrypted API key
  - [ ] 32.5 Implement `POST /api/ai/validate-key` — test key against provider's models endpoint, return `{ valid, provider, error }`
  - [ ] 32.6 Implement `POST /api/ai/generate` — full generation flow: access check → trial check → build prompt → call provider → save to `ai_generations` → return result; increment trial counter only on success
  - [ ] 32.7 Implement `GET/DELETE /api/ai/generations` — paginated history, delete by id

- [ ] 33. Prompt templates & base images (backend)
  - [ ] 33.1 Implement `GET/POST/PUT/DELETE /api/ai/templates` — list platform + user templates, save/edit/delete user templates
  - [ ] 33.2 Seed 6 platform prompt templates with preview images: Digital Product Launch, Free Resource Giveaway, Webinar Announcement, Testimonial Post, Behind the Scenes, Course Promotion
  - [ ] 33.3 Implement `GET/POST/DELETE /api/ai/base-images` — list platform + user base images, upload user base image (Multer, images only, max 10MB)
  - [ ] 33.4 Seed platform base image library: 10 gradient backgrounds, 5 minimal backgrounds, 5 texture backgrounds, 4 product mockup frames (phone, laptop, book, tablet)

- [ ] 34. Admin AI controls (backend + digikraft admin panel)
  - [ ] 34.1 Implement `GET /api/admin/ai/users` — list all DigiProfile users with AI access status, trial used/limit, last generation date
  - [ ] 34.2 Implement `PUT /api/admin/ai/users/:userId` — toggle `enabled`, set `trial_limit`, reset `trial_used` to 0, save admin note
  - [ ] 34.3 Implement `GET /api/admin/ai/stats` — aggregate: total generations today/week/all-time, provider breakdown, failed count, users with own API key
  - [ ] 34.4 Implement admin template management: `POST/PUT/DELETE /api/admin/ai/templates` and `POST/DELETE /api/admin/ai/base-images`
  - [ ] 34.5 Add "AI Studio" tab to the DigiProfile section in the existing digikraft admin panel (`digikraft.shop/frontend/src/admin/modules/digiprofile.js`) — user list with enable/disable toggle, trial counter, reset button, usage stats cards, platform template manager

- [ ] 35. AI Studio frontend (creator dashboard)
  - [ ] 35.1 Build `pages/dashboard/ai-studio.vue` — main page with tabs: Generate, Templates, Base Images, History
  - [ ] 35.2 Build **Generate tab** — left panel: generation type selector (post/story/caption/combined), template picker with preview thumbnails, variable input form (product name, description, tone dropdown, color palette, style, CTA), base image picker, custom prompt textarea (advanced toggle); right panel: live result preview with 1080×1080 or 1080×1920 frame mockup
  - [ ] 35.3 Build **API Key setup card** — shown when no key is configured; provider selector (Gemini / OpenRouter), API key input with show/hide toggle, "Validate & Save" button, link to get free OpenRouter key, trial usage indicator (e.g. "2/2 trial generations used")
  - [ ] 35.4 Build **Templates tab** — grid of platform templates (with preview image, title, category badge) + user's saved templates; "Use" button fills the generate form; "Save New Template" button opens a modal with title, category, image prompt textarea, caption prompt textarea, variables tag input
  - [ ] 35.5 Build **Base Images tab** — grid of platform backgrounds (categorized: gradients, minimal, textures, mockups) + user uploaded images; select to use in generation; upload button with drag-and-drop zone
  - [ ] 35.6 Build **History tab** — masonry/grid gallery of past generations; each card shows: thumbnail, generation type badge, date, "Download", "Copy Caption", "Regenerate" actions; empty state with CTA to generate first post
  - [ ] 35.7 Build `components/ai/GenerationResultModal.vue` — full-screen preview of generated result: image at full size, caption text with copy button, hashtags with copy button, "Download Image", "Save to Library", "Regenerate" buttons
  - [ ] 35.8 Handle all access states gracefully: Free plan locked state (show trial CTA), trial exhausted state (show "Add your API key" prompt), admin-disabled state (show "Feature not available" message), provider error states (invalid key, rate limit, generation failed)

- [ ] 36. Property-based tests for AI Studio
  - [ ] 36.1 Test: trial counter never exceeds `trial_limit` under concurrent requests (use parallel test calls)
  - [ ] 36.2 Test: generation never proceeds when `admin_ai_access.enabled = 0`, regardless of plan or trial status
  - [ ] 36.3 Test: API key is never returned in any response from `/api/ai/config` or `/api/ai/generate`
  - [ ] 36.4 Test: a failed generation (provider error) does not increment `trial_used`
