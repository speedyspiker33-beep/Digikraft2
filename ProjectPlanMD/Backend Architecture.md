# Backend Architecture

Backend data flows, API architecture, and request lifecycle for DigiKraft.shop.

## Table of Contents

- [Request Lifecycle](#request-lifecycle)
- [Authentication Flow](#authentication-flow)
- [Product Management Flow](#product-management-flow)
- [Order Processing Flow](#order-processing-flow)
- [Satellite Page Engine Flow](#satellite-page-engine-flow)
- [File Upload Flow](#file-upload-flow)
- [Caching Strategy](#caching-strategy)
- [Error Handling](#error-handling)
- [Security Measures](#security-measures)
- [Logging](#logging)
- [Background Jobs](#background-jobs)

---

## Request Lifecycle

```
Client Request
  ↓
Nginx / CDN (static assets, SSL)
  ↓
Vercel/Netlify (frontend) OR Express (API)
  ↓
Express Middleware Stack:
  1. CORS
  2. Helmet (security headers)
  3. Rate limiting
  4. JWT verification (if protected)
  5. Request logging
  ↓
Route Handler
  ↓
Controller Function
  ↓
Prisma ORM Query
  ↓
PostgreSQL Database
  ↓
Response JSON
  ↓
Client
```

---

## Authentication Flow

### Registration

```
POST /api/v1/auth/register
Body: { email, password, name }
```

1. Validate input (Joi/Zod)
2. Check email uniqueness
3. Hash password (bcrypt, 12 rounds)
4. Create user record (role: CUSTOMER)
5. Generate JWT + refresh token
6. Set refresh token as httpOnly cookie
7. Return: { user, accessToken }

### Login

```
POST /api/v1/auth/login
Body: { email, password }
```

1. Find user by email
2. Compare password hash
3. Generate tokens
4. Update lastLogin timestamp
5. Return tokens

### Protected Route Access

```
GET /api/v1/admin/dashboard
Headers: Authorization: Bearer {accessToken}
```

1. JWT middleware verifies token
2. Decode: { userId, role, iat, exp }
3. Attach user to req object
4. Role middleware checks permissions
5. Proceed to controller OR 403 Forbidden

### Token Refresh

```
POST /api/v1/auth/refresh
Cookies: refreshToken
```

1. Verify refresh token
2. Check against database (prevent reuse)
3. Generate new access token
4. Rotate refresh token (security)
5. Return new tokens

---

## Product Management Flow

### Create Product (Super Admin)

```
POST /api/v1/products
Body: { title, price, description, categories[], pageId? }
```

1. Validate input
2. Generate slug from title (unique)
3. If pageId provided: verify page exists
4. Create product record
5. Associate categories
6. If files uploaded: generate signed S3 URLs
7. Return product with download URLs

### Create Product (Sub-Admin)

```
POST /api/v1/products
Headers: Authorization: Bearer {token}
Body: { title, price… }
```

1. JWT verify
2. Role check: SUB_ADMIN or above
3. Get user's assigned page from token/context
4. Force pageId to assigned page (ignore request)
5. Create product (tagged to their page only)
6. Return product

### List Products (with filtering)

```
GET /api/v1/products?page=1&limit=24&category=graphics&pageId=coreldraw
```

1. Parse query parameters
2. Build Prisma where clause:
   ```javascript
   {
     isActive: true,
     categories: { some: { slug: 'graphics' } },
     page: { slug: 'coreldraw' } // if filtered
   }
   ```
3. Execute paginated query
4. Return: { products, pagination: { total, page, pages } }

---

## Order Processing Flow

### Create Order (Cart Checkout)

```
POST /api/v1/orders
Body: { items: [{productId, quantity}], paymentMethod }
```

1. Validate items exist and are active
2. Calculate totals (sum product prices)
3. Create order record (status: PENDING)
4. Create order items (link products)
5. Initiate payment based on method:
   - **Stripe:**
     - Create PaymentIntent
     - Return clientSecret to frontend
   - **Razorpay:**
     - Create order
     - Return orderId to frontend
   - **PayPal:**
     - Create order
     - Return approval URL
6. Return: { order, paymentDetails }

### Payment Webhook (Stripe Example)

```
POST /webhooks/stripe
Headers: Stripe-Signature
```

1. Verify webhook signature
2. Parse event type
3. Handle event:
   - **payment_intent.succeeded:**
     - Update order status: PAID
     - Send confirmation email
     - Generate download tokens
     - Clear user cart
   - **payment_intent.payment_failed:**
     - Update order status: FAILED
     - Send failure email with retry link
4. Return 200 OK (prevent retries)

### Download Access

```
GET /api/v1/orders/:orderId/downloads
Headers: Authorization: Bearer {token}
```

1. Verify user owns this order
2. Check order status is PAID
3. Generate time-limited signed URLs (S3)
4. Return: [{ filename, url, expiresAt }]

---

## Satellite Page Engine Flow

### Create Page (Super Admin)

```
POST /api/v1/pages
Body: { name, slug, template, adminUserId }
```

**Transaction:**
1. Create page record in database
2. Create folder structure:
   - /pages/{slug}/
   - /pages/{slug}/index.html
   - /pages/{slug}/assets/
3. Copy template files to folder
4. Create PageAdmin record (assign sub-admin)
5. Update navigation config (add to header)
6. Create default categories for page
7. Send welcome email to sub-admin
8. Return: { page, adminCredentials }

### Page Settings Update

```
PUT /api/v1/pages/:pageId/settings
Body: { header, footer, sidebar, sections }
```

1. Validate page exists
2. Validate user has admin rights for this page
3. Merge new settings with existing
4. Update page.settings JSON field
5. Trigger static regeneration (if using SSG)
6. Return updated page

---

## File Upload Flow

### Direct Upload (Small files)

```
POST /api/v1/upload
Body: multipart/form-data (file)
```

1. Verify authentication
2. Validate file type (whitelist)
3. Validate file size (< 10MB)
4. Generate unique filename
5. Upload to S3 / local storage
6. Return: { url, filename, size }

### Signed URL (Large files, recommended)

```
GET /api/v1/upload/signed-url?filename=product.zip&type=application/zip
```

1. Verify auth
2. Generate S3 presigned POST URL
3. Return: { url, fields, key }
4. Client uploads directly to S3
5. Client confirms upload complete
6. Server verifies and saves reference

---

## Caching Strategy

### Redis Keys

```
products:list:{filters}     → TTL 5 minutes
products:detail:{slug}      → TTL 10 minutes
pages:config:{slug}         → TTL 1 hour
users:session:{userId}      → TTL 7 days
cart:{sessionId}            → TTL 30 days
```

### Cache Invalidation

**Product updated:**
```
→ DEL products:list:*
→ DEL products:detail:{slug}
```

**Page settings updated:**
```
→ DEL pages:config:{slug}
→ Trigger frontend rebuild (if static)
```

---

## Error Handling

### Global Error Middleware

```javascript
app.use((err, req, res, next) => {
  // Log error (Sentry, console)
  logger.error(err);
    
  // Standardized response
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: isProduction ? 'Something went wrong' : err.message,
      ...(isDevelopment && { stack: err.stack })
    }
  });
});
```

### Error Types

| Code | HTTP | Scenario |
|:-----|:-----|:---------|
| VALIDATION_ERROR | 400 | Invalid input |
| AUTHENTICATION_ERROR | 401 | Invalid/missing token |
| AUTHORIZATION_ERROR | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource doesn't exist |
| CONFLICT | 409 | Duplicate email, etc. |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Security Measures

### Input Validation

- **Joi** or **Zod** schemas for all inputs
- Sanitize HTML (DOMPurify) for rich text
- SQL injection prevention (Prisma handles this)

### Authentication

- JWT: Short expiry (15 min), secure algorithms (HS256)
- Refresh tokens: HttpOnly, SameSite=strict, secure
- Passwords: Bcrypt 12+ rounds, pepper option

### Authorization

- Role-based access control (RBAC)
- Resource-level permissions (own data only)
- Middleware chain: authenticate → authorize → handle

### Headers

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // adjust as needed
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: { maxAge: 31536000 },
}));
```

### Rate Limiting

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);
```

---

## Logging

### Structured Logging (Pino/Winston)

```javascript
logger.info('Order created', {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  page: order.pageId
});
```

### Log Levels

- **ERROR**: Exceptions, failed payments, security events
- **WARN**: Validation failures, rate limiting
- **INFO**: Successful operations, state changes
- **DEBUG**: Detailed flow (development only)

---

## Background Jobs

### Queue System (Bull + Redis)

| Job | Trigger | Processor |
|:-----|:--------|:----------|
| sendEmail | User action | Sendgrid API |
| generateInvoice | Order paid | PDF generation |
| cleanupExpiredCarts | Daily cron | Delete old carts |
| backupDatabase | Weekly cron | S3 upload |
| aiProcessProduct | Product created | OpenAI API (future) |

### Example Job

```javascript
emailQueue.add('order-confirmation', {
  to: user.email,
  orderId: order.id
}, {
  attempts: 3,
  backoff: 'exponential',
  delay: 1000
});
```

---

## Related Documents

- [System Architecture](System%20Architecture.md) - System connections and data flow
- [Tech Stack](Tech%20Stack.md) - Technology choices
- [Folder Structure](Folder%20Structure.md) - Project organization
- [Web Flow](Web%20Flow.md) - User flows and navigation
