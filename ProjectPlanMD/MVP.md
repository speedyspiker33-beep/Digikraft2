# DigiKraft.shop - Minimum Viable Product

## MVP Scope (Week 1-4)

### Week 1: Foundation

**Goal**: Core infrastructure running

#### Tasks

- [ ] Project folder structure setup
- [ ] Database schema (users, products, orders, pages)
- [ ] Authentication system (email/password, Google OAuth)
- [ ] Base frontend layout (header, footer, product grid)

**Deliverables**

- Working local development environment
- User can register/login
- Blank page with correct styling loads

---

### Week 2: Main Marketplace

**Goal**: Customer can browse and buy

#### Tasks

- [ ] Product catalog (grid view, filters, search)
- [ ] Product detail page (basic mode)
- [ ] Shopping cart (session-based)
- [ ] Checkout flow (PayPal integration)
- [ ] Order confirmation email

**Deliverables**

- Customer can: browse → add to cart → pay → receive email
- Admin can: view orders, mark as completed

---

### Week 3: Admin Panel Core

**Goal**: Admin can manage everything

#### Tasks

- [ ] Super Admin dashboard (stats, recent activity)
- [ ] Product CRUD (create, read, update, delete)
- [ ] User management (view, roles)
- [ ] Order management (view, status update)
- [ ] Basic settings (site name, currency)

**Deliverables**

- Admin panel functional for daily operations
- No code changes needed for content updates

---

### Week 4: Satellite Page v1

**Goal**: First specialized hub live

#### Tasks

- [ ] Satellite page engine (create from template)
- [ ] CorelDRAW Hub (homepage, 3 sections)
- [ ] Sub-Admin role (restricted access)
- [ ] Products tagged to specific pages
- [ ] Unified cart across main + satellite

**Deliverables**

- CorelDRAW Hub live at /coreldraw
- Sub-admin can manage only CorelDRAW products
- Customer cart persists between sites

---

## Post-MVP Priorities (Phase 2)

| Priority | Feature | Business Value |
|----------|---------|---------------|
| P1 | Landing page builder | Higher conversion |
| P1 | Visual layout editor | Faster page creation |
| P2 | AI agent integration | Automation, scale |
| P2 | Additional satellite pages | Market expansion |
| P3 | Multi-vendor | Revenue growth |
| P3 | Mobile app | User retention |

---

## MVP Technical Constraints

- Single currency (USD)
- Single language (English)
- 2 payment gateways (PayPal + Razorpay)
- No AI features
- No advanced analytics
- Server-side rendering for SEO

---

## Success Metrics

- [ ] Page load < 2 seconds
- [ ] Checkout completion > 60%
- [ ] Admin task completion < 3 clicks
- [ ] Zero critical bugs
- [ ] Mobile score > 90 Lighthouse

---

## Related Documents

- [PRD](PRD.md) - Product Requirements
- [Tech Stack](Tech%20Stack.md) - Technology choices
- [Implementation Plan](Implementation%20Plan.md) - Development timeline
- [Folder Structure](Folder%20Structure.md) - Project organization
