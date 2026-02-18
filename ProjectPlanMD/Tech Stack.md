# DigiKraft.shop - Technology Stack

## Frontend

### Core

- **HTML5** - Semantic markup
- **CSS3** with Custom Properties (variables)
- **Vanilla JavaScript** (ES6+, no framework for MVP)
- **Optional**: Alpine.js for reactivity (lightweight)

### Styling

- **Tailwind CSS** (recommended) OR custom CSS with design tokens
- **PostCSS** for processing
- **Autoprefixer** for browser compatibility

### Icons

- **Lucide** or **Heroicons** (SVG, 24px)

### Build Tools

- **Vite** (fast dev server, optimized builds)
- OR: Plain HTML/CSS/JS with live server (MVP simplicity)

---

## Backend

### Runtime

- **Node.js** (18+ LTS)

### Framework

- **Express.js** (lightweight, flexible)

### Database

- **PostgreSQL** (primary, relational data)
- **Redis** (sessions, caching, queues)

### ORM

- **Prisma** (type-safe, great DX) OR **Knex.js** (query builder)

### Authentication

- **Passport.js** (local, Google OAuth, JWT)
- **bcrypt** (password hashing)
- **jsonwebtoken** (JWT tokens)

### File Storage

- **AWS S3** or **Cloudflare R2** (product files, images)
- **Local disk** (MVP only, migrate to cloud before launch)

### Email

- **Nodemailer** + **SendGrid** OR **Mailgun**

### Payment Processing

- **Stripe** (cards, international)
- **Razorpay** (India, UPI)
- **PayPal** (express checkout)

### Webhooks

- **Express** raw body parser for signature verification
- **stripe-webhook** + **razorpay-webhook** handlers

---

## DevOps & Infrastructure

### Version Control

- **Git** + **GitHub**

### Hosting

- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or DigitalOcean
- **Database**: Railway PostgreSQL, Supabase, or AWS RDS

### CDN

- **Cloudflare** (caching, DDoS protection, SSL)

### Domain & SSL

- **Namecheap** or **Cloudflare** (domain)
- **Let's Encrypt** (free SSL)

### Monitoring

- **Sentry** (error tracking)
- **LogRocket** or **Plausible** (analytics, privacy-focused)

---

## Development Tools

### Code Editor

- **VS Code** with extensions:
  - Prettier (formatting)
  - ESLint (linting)
  - Tailwind CSS IntelliSense
  - Prisma extension

### API Testing

- **Insomnia** or **Postman**

### Database GUI

- **TablePlus** or **pgAdmin**

### Design Handoff

- **Figma** (from Stitch exports)

---

## Folder-by-Folder Tech Choices

| Folder | Technology | Purpose |
|--------|-----------|---------|
| `/frontend/` | HTML/CSS/JS + Tailwind | Customer-facing site |
| `/admin/` | HTML/CSS/JS + Tailwind | Admin panel (separate build) |
| `/api/` | Node.js + Express | REST API |
| `/shared/` | Prisma schema | Database models |
| `/modules/` | Vanilla JS | Reusable components |
| `/config/` | JSON/JS | Site configurations |

---

## API Architecture

### RESTful Endpoints

```
/api/v1/auth      → Login, register, logout, refresh
/api/v1/users     → CRUD users, roles
/api/v1/products  → CRUD products, categories
/api/v1/orders    → CRUD orders, status
/api/v1/pages     → Satellite page management
/api/v1/payments  → Process payments, webhooks
/api/v1/settings  → Site configuration
/api/v1/upload    → File uploads (signed URLs)
```

### Authentication

- JWT access token (15 min expiry)
- Refresh token (7 days, httpOnly cookie)
- Role-based middleware

---

## Database Schema (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String?  // null for OAuth users
  name      String
  role      Role     @default(CUSTOMER)
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  orders    Order[]
  pageAdmins PageAdmin[]
}

model Page {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  template    String   @default("default")
  isActive    Boolean  @default(true)
  settings    Json?    // flexible configuration
  createdAt   DateTime @default(now())
  
  products    Product[]
  admins      PageAdmin[]
}

model PageAdmin {
  id     String @id @default(uuid())
  userId String
  pageId String
  role   AdminRole @default(MANAGER)
  
  user   User   @relation(fields: [userId], references: [id])
  page   Page   @relation(fields: [pageId], references: [id])
  
  @@unique([userId, pageId])
}

model Product {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10, 2)
  salePrice   Decimal? @db.Decimal(10, 2)
  type        ProductType @default(BASIC)
  content     Json?    // landing page sections
  files       Json     // download URLs
  isActive    Boolean  @default(true)
  pageId      String?
  
  page        Page?    @relation(fields: [pageId], references: [id])
  categories  Category[]
  orderItems  OrderItem[]
}

model Order {
  id            String   @id @default(uuid())
  status        OrderStatus @default(PENDING)
  total         Decimal  @db.Decimal(10, 2)
  currency      String   @default("USD")
  customerEmail String
  customerName  String
  userId        String?
  paymentId     String?
  createdAt     DateTime @default(now())
  
  user          User?    @relation(fields: [userId], references: [id])
  items         OrderItem[]
}

// ... additional models
```

---

## Environment Variables

```env
# .env

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/digikraft"

# JWT
JWT_SECRET="super-secret-key-min-32-chars"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Payments
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""

# Email
SENDGRID_API_KEY=""
FROM_EMAIL="noreply@digikraft.shop"

# Storage
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
S3_BUCKET=""
```

---

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- API Response Time: < 200ms (p95)
- Database Query Time: < 50ms (p95)
- Lighthouse Score: > 90 (all categories)

---

## Related Documents

- [PRD](PRD.md) - Product Requirements
- [MVP](MVP.md) - Minimum Viable Product
- [Folder Structure](Folder%20Structure.md) - Project organization
- [Implementation Plan](Implementation%20Plan.md) - Development timeline
