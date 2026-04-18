# Requirements Document: DigiProfile Website

## Introduction

DigiProfile is a standalone SaaS platform for Indian creators, influencers, coaches, and small businesses. It gives every creator a single link-in-bio page where they can showcase their links, sell digital products, host webinars, build paid communities, accept donations, and automate Instagram DMs — all without needing a website or technical knowledge. It is completely separate from digikraft.shop and targets the same market as SuperProfile.

---

## Requirements

### 1. User Authentication & Accounts

**1.1** A visitor must be able to register with email, password, name, and phone number. On successful registration, a profile is automatically created with a username derived from their email prefix.

**1.2** A registered user must be able to log in with email and password and receive a JWT token valid for 7 days.

**1.3** A user must be able to request a password reset via email and set a new password using a time-limited reset link.

**1.4** A logged-in user must be able to view and update their account details (name, phone, email, password).

**1.5** All authenticated API routes must reject requests with missing, expired, or invalid JWT tokens with a 401 response.

**Correctness Properties:**
- A user cannot log in with an incorrect password
- Two users cannot register with the same email address
- A password reset link must expire after 1 hour and be single-use
- Passwords must be stored as bcrypt hashes, never plaintext

---

### 2. Creator Profile

**2.1** Each user must have exactly one public profile accessible at `/p/:username`.

**2.2** A creator must be able to set their username (alphanumeric + underscore only), display name, bio, avatar, cover image, and category (creator / business / artist / influencer / freelancer).

**2.3** The system must check username availability in real time (debounced 400ms) and reject usernames already taken.

**2.4** A creator must be able to choose a theme style (minimal / gradient / dark / neon / glass) and a theme color from a color picker or preset palette.

**2.5** A creator must be able to set SEO title and description for their profile page.

**2.6** A creator must be able to pause their profile (hides it from public) or reactivate it.

**2.7** The public profile page must render server-side (SSR) for SEO and fast load on mobile.

**Correctness Properties:**
- A paused profile must return 404 to public visitors
- Username changes must not break existing links (redirect old username to new if changed)
- Profile page must load in under 2 seconds on a 4G mobile connection

---

### 3. Profile Block Builder (Drag-and-Drop)

**3.1** A creator must be able to add, remove, reorder, and enable/disable blocks on their profile page using a drag-and-drop interface.

**3.2** The system must support the following block types: link_button, product_card, lead_magnet, webinar_card, community_card, consultation, youtube_embed, instagram_feed, testimonials, countdown_timer, text_block, divider, donation_widget.

**3.3** Block reordering must be saved via a single bulk API call with the new sort order array.

**3.4** A live preview of the profile must update in the dashboard as the creator makes changes.

**Correctness Properties:**
- Block sort order must be unique per profile (no two blocks share the same sort_order)
- Disabled blocks must not appear on the public profile page
- Deleting a block must not delete the underlying entity (e.g., deleting a product_card block must not delete the product)

---

### 4. Link Management

**4.1** A creator must be able to add custom links with a title, URL, icon (Font Awesome class), and enabled/disabled toggle.

**4.2** Links must be reorderable via drag-and-drop.

**4.3** Each link must track click count when `track_clicks` is enabled.

**4.4** Free plan users are limited to 5 links. Attempting to add a 6th must return a 403 with `upgrade_required`.

**Correctness Properties:**
- A disabled link must not appear on the public profile
- Click tracking must increment atomically (no race conditions on concurrent clicks)
- Link URLs must be validated as valid HTTP/HTTPS URLs before saving

---

### 5. Digital Products

**5.1** A creator on Creator plan or above must be able to create digital products with title, description, price (INR), cover image, and file upload (PDF, ZIP, images — max 50MB).

**5.2** Product types supported: file download, link unlock, course (external URL), template.

**5.3** After a successful Razorpay payment, the buyer must receive a time-limited download link via email (valid 48 hours, single-use).

**5.4** The creator must be able to see total sales count and revenue per product in their dashboard.

**5.5** Free plan users cannot create digital products. Creator plan: max 10 products. Pro plan: unlimited.

**Correctness Properties:**
- A download link must not work after it expires or has been used once
- Product files must not be publicly accessible without a valid order token
- Payment verification must use Razorpay HMAC signature validation before granting access

---

### 6. Lead Magnet System

**6.1** A creator must be able to create lead magnets of types: pdf_ebook, checklist, template, video_access, discount_code, webinar_access.

**6.2** Each lead magnet must have a configurable email capture form (fields: name, email, phone — each optional/required per creator's choice).

**6.3** When a visitor submits the lead magnet form, the system must: store the lead, send the resource to their email, and optionally trigger an AutoDM rule.

**6.4** A creator must be able to view all captured leads with name, email, phone, source, and date, and export them as CSV.

**6.5** Free plan: 1 lead magnet. Creator plan: 5. Pro plan: unlimited.

**Correctness Properties:**
- A lead's email must be validated before storing
- The same email must not be captured twice for the same lead magnet (deduplication)
- File delivery email must be sent within 30 seconds of form submission

---

### 7. Instagram AutoDM Automation

**7.1** A creator on Creator plan or above must be able to connect their Instagram Business account via Meta OAuth (scopes: instagram_basic, instagram_manage_messages, instagram_manage_comments, pages_messaging).

**7.2** The system must support the following automation trigger types:
- `comment_keyword` — someone comments a keyword on a Post or Reel
- `story_reply` — someone replies to an Instagram Story
- `live_comment` — someone comments during an Instagram Live
- `dm_keyword` — someone sends a DM containing a keyword
- `story_mention` — someone mentions the creator in their Story

**7.3** For each automation rule, the creator must be able to configure:
- One or more trigger keywords (case-insensitive matching)
- DM message format: text+button, image/video, card, or voice message
- Optional public reply to the comment (e.g., "Check your DMs! 📩")
- Follow Check: verify the sender follows the creator before sending DM
- Email Collect: bot asks for email address in the DM conversation
- Follow Check and Email Collect can be enabled simultaneously

**7.4** Dynamic variables must be supported in DM messages: `<name>`, `<email>`, `<username>`, `<follower_count>`.

**7.5** A creator must be able to set up multi-step DM sequences with configurable delays between steps (e.g., immediate → 24h → 72h).

**7.6** The Meta webhook endpoint must respond within 200ms to avoid Meta retrying the event.

**7.7** The system must log every automation trigger with: rule triggered, sender IG username, action taken, status (sent/failed/skipped), and timestamp.

**7.8** Free plan: no AutoDM. Creator plan: 1 Instagram account, 3-step sequences. Pro plan: 5 accounts, unlimited sequences.

**Correctness Properties:**
- The Meta webhook verification challenge must be returned exactly as received
- A DM must not be sent twice to the same user for the same trigger event (deduplication by event ID)
- If Follow Check is enabled and the user does not follow, the main DM must not be sent
- Access tokens must be stored AES-256 encrypted, never in plaintext
- Token expiry must be tracked and the creator notified 7 days before expiry

---

### 8. Razorpay Payments

**8.1** A creator on Creator plan or above must be able to connect their Razorpay account by entering their Key ID and Key Secret.

**8.2** A creator must be able to enable a donation widget on their profile with preset donation amounts (e.g., ₹49, ₹99, ₹199, ₹499) and a UPI ID.

**8.3** Visitors must be able to purchase digital products and pay for webinars/consultations/communities via Razorpay checkout.

**8.4** Payment verification must use HMAC-SHA256 signature validation on every payment callback before marking an order as paid.

**8.5** The creator must be able to view all orders (product purchases, donations, webinar registrations) with buyer details, amount, and status.

**Correctness Properties:**
- An order must never be marked as paid without a valid Razorpay signature
- The Razorpay Key Secret must be stored AES-256 encrypted, never returned in any API response
- A failed payment must not trigger product delivery or access grant

---

### 9. Webinar / Event Hosting

**9.1** A creator on Creator plan or above must be able to create webinar events with title, description, cover image, date/time, duration, platform (Zoom/Google Meet/YouTube Live/custom), meeting URL, price (0 = free), and max attendees.

**9.2** Free webinars must require only email capture for registration. Paid webinars must require Razorpay payment before revealing the meeting link.

**9.3** The system must send reminder emails to registered attendees 24 hours and 1 hour before the event.

**9.4** Creator plan: 2 webinars per month. Pro plan: unlimited.

**Correctness Properties:**
- The meeting URL must not be revealed to unregistered or unpaid attendees
- Registration must be blocked once max_attendees is reached
- Reminder emails must not be sent for cancelled events

---

### 10. Paid Community / Membership

**10.1** A creator on Creator plan or above must be able to create a paid community with title, description, platform (Telegram/WhatsApp/Discord/custom), invite link, and monthly/yearly pricing.

**10.2** Visitors must be able to join a community via Razorpay subscription. The invite link must only be revealed after successful payment.

**10.3** When a subscription is cancelled or payment fails, the creator must be notified so they can revoke access manually (or automatically for platforms that support it).

**10.4** Creator plan: 1 community. Pro plan: unlimited.

**Correctness Properties:**
- The invite link must not be accessible without an active paid subscription
- Subscription status must be updated via Razorpay webhook, not client-side

---

### 11. 1:1 Consultation Booking

**11.1** A creator on Creator plan or above must be able to offer consultation slots with title, duration (15/30/60 min), price, platform, weekly availability schedule, and buffer time between slots.

**11.2** Visitors must be able to view available slots and book a session via Razorpay payment.

**11.3** On successful booking, both the creator and the visitor must receive a confirmation email with the meeting details.

**11.4** The system must send a reminder email to both parties 24 hours before the session.

**Correctness Properties:**
- A slot must not be double-booked (atomic slot reservation)
- Booking must be blocked for slots in the past
- Meeting details must only be sent after payment confirmation

---

### 12. Analytics

**12.1** A creator must be able to view a summary dashboard showing: total profile views, total link clicks, CTR (clicks/views), top performing links, views by day (chart), device breakdown (mobile/desktop/tablet), and top referrers.

**12.2** Analytics events must be recorded for: profile views, link clicks, product views, lead magnet submissions, webinar registrations, and purchases.

**12.3** The creator must be able to filter analytics by time period: last 7 days, last 30 days, all time.

**12.4** Pro plan creators must be able to export analytics data as CSV.

**12.5** Behavioral analytics must track: time on page, scroll depth (25/50/75/100%), and which profile sections were viewed.

**Correctness Properties:**
- Analytics recording must be non-blocking (fire-and-forget, must not slow down page load)
- A single visitor refreshing the page must not inflate view counts (session-based deduplication)
- Analytics data must never include PII in aggregate reports

---

### 13. KYC Verification

**13.1** A creator must be able to submit KYC documents (PAN, Aadhaar, GST, bank account + IFSC) and upload supporting document images.

**13.2** KYC status must be one of: pending, submitted, verified, rejected.

**13.3** Payment features (Razorpay connect, donations, product sales) must require KYC status to be `verified`.

**13.4** The platform admin must be able to review KYC submissions, approve or reject them, and add a note visible to the creator.

**13.5** The creator must receive an email notification when their KYC status changes.

**Correctness Properties:**
- KYC document images must not be publicly accessible (served via authenticated signed URLs only)
- A creator cannot bypass KYC to access payment features

---

### 14. Affiliate / Partner Program

**14.1** Any registered user must be able to join the affiliate program and receive a unique referral code and URL (`/ref/:code`).

**14.2** When a new user registers via a referral link and upgrades to a paid plan, the affiliate must earn 30% commission on the first payment and all subsequent renewals.

**14.3** A creator must be able to view their affiliate dashboard: referral link, total clicks, total signups, total conversions, total earnings, and pending payout.

**14.4** A creator must be able to request a payout when their pending balance reaches ₹500 or more.

**Correctness Properties:**
- A user cannot refer themselves
- Commission must only be credited after the referred user's payment is confirmed (not on signup)
- Referral attribution must be stored at signup time and persist through plan upgrades

---

### 15. Subscription Plans & Plan Enforcement

**15.1** The platform must offer three plans: Free, Creator (₹299/month), and Pro (₹799/month).

**15.2** Plan limits must be enforced server-side on every relevant API route. A 403 response with `{ error: "upgrade_required", feature: "...", required_plan: "..." }` must be returned when a limit is exceeded.

**15.3** The frontend must show an upgrade modal when a 403 `upgrade_required` response is received.

**15.4** Plan subscriptions must be managed via Razorpay subscriptions with webhook-based status updates.

**15.5** When a plan expires or is cancelled, the creator's account must be downgraded to Free and features exceeding Free limits must be disabled (not deleted).

**Correctness Properties:**
- Plan limits must be enforced on the backend, never only on the frontend
- Downgrading must disable excess features but must not delete data
- A creator on Free plan must never be able to access AutoDM, even by direct API call

---

### 16. Onboarding Wizard

**16.1** After registration, a new creator must be guided through a 6-step onboarding wizard: (1) choose username, (2) basic profile setup, (3) add first 3 links, (4) choose theme, (5) connect Instagram (optional), (6) completion screen with profile URL.

**16.2** The wizard must be skippable at any step after step 2.

**16.3** Onboarding completion status must be tracked so the wizard does not re-appear after completion.

**Correctness Properties:**
- Username chosen in step 1 must be validated for availability before proceeding to step 2
- Skipping Instagram connection must not block profile activation

---

### 17. Email Notifications

**17.1** The system must send transactional emails for: welcome on registration, password reset, KYC status change, new order/purchase, webinar reminder (24h + 1h), consultation reminder (24h), subscription renewal, subscription cancellation, lead magnet delivery, and Instagram token expiry warning.

**17.2** All emails must be sent via Nodemailer with a configured SMTP provider.

**Correctness Properties:**
- Emails must not be sent synchronously in the request-response cycle (use async queue)
- Failed email delivery must be logged but must not cause the originating API request to fail

---

### 18. Security

**18.1** All sensitive credentials (Razorpay key_secret, Instagram access_token, app_secret) must be stored AES-256 encrypted in the database.

**18.2** All public API routes must be rate-limited to 100 requests per minute per IP. Authenticated routes: 300 requests per minute.

**18.3** File uploads must be validated for MIME type (PDF, ZIP, JPEG, PNG, MP4 only) and size (max 50MB).

**18.4** All database queries must use parameterized statements (no string interpolation).

**18.5** CORS must be restricted to the DigiProfile frontend domain only.

**18.6** Meta webhook payloads must be verified using the X-Hub-Signature-256 header before processing.

**18.7** Razorpay webhook payloads must be verified using HMAC-SHA256 signature before processing.

**Correctness Properties:**
- No API response must ever include a raw secret key, access token, or password hash
- Rate limit headers (X-RateLimit-Remaining) must be included in all responses
- An invalid file type upload must be rejected before the file is written to disk

---

### 19. Public Profile Page

**19.1** The public profile page at `/p/:username` must be server-side rendered and include Open Graph meta tags (title, description, image) for social sharing previews.

**19.2** The page must display all enabled profile blocks in their configured order.

**19.3** The page must be fully functional and visually correct on mobile screens (320px minimum width).

**19.4** The page must include a "Powered by DigiProfile" footer link, removable on Creator plan and above.

**19.5** Link clicks must be tracked via a non-blocking POST to `/api/analytics/track` before redirecting.

**Correctness Properties:**
- A profile with status != 'active' must return a 404 page, not an error
- The public profile API must never return sensitive fields (key_secret, access_token, kyc documents)
- Open Graph image must fall back to avatar if no cover image is set

---

### 20. Marketing / Landing Pages

**20.1** The platform must have a marketing homepage explaining the product, key features, and a clear CTA to sign up.

**20.2** A pricing page must clearly display all three plans with feature comparison.

**20.3** The homepage must include social proof (creator count, testimonials).

**20.4** All marketing pages must be statically generated (SSG) for performance.


---

### 21. AI Content Generation Studio

**21.1** A creator must be able to access an AI Studio dashboard page to generate Instagram post images (1080×1080px), story images (1080×1920px), captions, and hashtags for their digital products.

**21.2** The AI Studio must support two AI providers that the creator configures with their own API key:
- **Google Gemini** — Gemini Flash for text, Imagen 3 for images
- **OpenRouter** — free models (Llama 3.1 for text, Stable Diffusion for images)

**21.3** A creator must be able to save their API key (Gemini or OpenRouter) in their account settings. The key must be validated against the provider's API before saving and stored AES-256 encrypted. The key must never be returned in any API response.

**21.4** The system must offer a **trial mode** — new users get 2 free AI generations using the platform's own API key, with no personal key required. After the trial is exhausted, the creator must add their own key to continue.

**21.5** The admin must be able to control AI Studio access per individual user from the admin panel:
- Enable or disable AI Studio for a specific user
- Set the trial generation limit (default: 2)
- Reset a user's trial count
- Add an admin note per user

**21.6** The system must provide **pre-built platform prompt templates** for common use cases: Digital Product Launch, Free Resource Giveaway, Webinar Announcement, Testimonial Post, Behind the Scenes, Course Promotion. Each template must have a preview image showing an example output.

**21.7** A creator must be able to:
- Browse platform templates with preview images
- Use a template with auto-filled variables from their product data
- Save their own custom prompt templates (title, image prompt, caption prompt, variables)
- Edit and delete their saved templates

**21.8** The system must provide a **base image / background library** with platform-provided assets (gradients, minimal backgrounds, textures, product mockup frames). A creator must also be able to upload their own base images.

**21.9** The generation interface must allow the creator to:
- Select generation type: post image, story image, caption only, or combined (image + caption)
- Pick a prompt template or write a custom prompt
- Select a base image/background or upload one
- Fill in variables: product name, description, tone, color palette, style, CTA
- Preview the generated result before saving
- Regenerate with the same or modified prompt
- Download the generated image
- Copy the generated caption and hashtags

**21.10** All past generations must be saved in a gallery view where the creator can browse, re-generate, download, or delete them.

**21.11** AI Studio must be available on Creator and Pro plans (with own API key). Free plan users see a locked preview with trial CTA. Trial (2 generations) is available to all plans before requiring a key.

**21.12** The admin panel must show AI usage statistics: total generations per day/week, provider breakdown (Gemini vs OpenRouter), failed generation rate, and count of users who have added API keys.

**Correctness Properties:**
- A generation must never proceed if `admin_ai_access.enabled = 0` for that user, regardless of plan
- Trial generations must be counted atomically — concurrent requests must not allow more than the trial limit
- An invalid or expired API key must return a clear `invalid_api_key` error, not a generic 500
- The platform's own trial API key must never be exposed to the client
- A failed generation must be logged with the error message but must not consume a trial credit
