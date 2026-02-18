# DigiKraft.shop - Product Requirements Document

## 1. Project Overview

DigiKraft.shop is a modular digital marketplace platform with:

- Main marketplace website
- Satellite page system (specialized micro-sites)
- Hierarchical admin panel (Super Admin + Sub-Admin)
- No-code customization engine
- Future-ready AI agent architecture

## 2. Core Principles

### Modularity First

- Every feature is a self-contained module
- Add new features by adding folders, not modifying existing code
- Satellite pages are independent websites injected into main system

### Consistency Management

> **IMPORTANT FOR AI COLLABORATION:**
> 
> - Stitch generates visual templates with varying navigation scope
> - Super Admin sees ALL options (full sidebar)
> - Sub-Admin sees CONTEXTUAL options (filtered sidebar)
> - Implementation must maintain consistent naming across all views
> - Use shared component library to ensure UI consistency

### Extensibility Rules

1. New satellite page = New folder in `/pages/`
2. New header feature = New folder in `/modules/header/features/`
3. New admin feature = New folder in `/admin/modules/`
4. New API endpoint = New folder in `/api/routes/`

## 3. User Roles & Permissions

| Role | Scope | Permissions |
|------|-------|-------------|
| Super Admin | Global | Full system access, all satellite pages, payment settings, user management |
| Sub-Admin | Single Satellite Page | Products, layout, content, users for assigned page only |
| Customer | Frontend | Browse, purchase, download, account management |
| Guest | Frontend | Browse only, purchase requires account |

## 4. Key Features

### Phase 1 (MVP)

- [ ] Main marketplace with product grid
- [ ] Basic admin panel (products, orders, users)
- [ ] Payment integration (PayPal, Razorpay)
- [ ] Email notifications
- [ ] 1 Satellite page (CorelDRAW Hub)

### Phase 2

- [ ] Satellite page system with sub-admin
- [ ] Visual layout builder
- [ ] Landing page product mode
- [ ] Category management
- [ ] Advanced customization (header, footer, sidebar)

### Phase 3

- [ ] AI agent integration
- [ ] Multi-vendor marketplace
- [ ] Advanced analytics
- [ ] Mobile apps

## 5. Design System

- **Style**: Clean, minimal, white background, blue accent (#2563EB)
- **Typography**: Inter (sans-serif), Playfair Display (optional headlines)
- **Spacing**: 4px base unit, 24px gaps, 32px padding
- **Components**: Cards, tables, forms, modals, dropdowns

## 6. Critical Implementation Notes

### Navigation Consistency

Stitch generates different sidebar scopes:

- Screen 1-2 (Dashboard): Full Super Admin sidebar
- Screen 4 (Sub-Admin): Contextual filtered sidebar

Implementation must:
1. Use same component names across all views
2. Filter visibility based on role, not duplicate code
3. Maintain active state styling consistently

### Satellite Page Architecture

```
/pages/coreldraw/              ← Independent website
  /index.html                  ← Homepage
  /macros/                     ← Feature folder (add new features here)
  /plugins/                    ← Feature folder
  /designs/                    ← Feature folder
  /cdr-converter/              ← NEW: Drop in new feature folder
    /index.html                ← Tool interface
    /assets/                   ← Tool-specific files
```

### Header Module Extensibility

```
/modules/header/
  /core/                       ← Base header component
  /features/                   ← Drop new features here
    /search/                   ← Search feature
      /template.html
      /script.js
      /config.json
    /cart/                     ← Cart feature
    /cdr-converter-link/       ← NEW: Satellite-specific feature
```

## 7. Acceptance Criteria

- [ ] Super Admin can create satellite page in 3 clicks
- [ ] Sub-Admin sees only their assigned page data
- [ ] New feature folder auto-registers with system
- [ ] Payment works across all pages (unified cart)
- [ ] Customizations persist after updates
- [ ] Mobile responsive all screens

## 8. Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Feature bloat | Strict modular folder structure |
| Inconsistent UI | Shared component library, design tokens |
| Scalability issues | Stateless API, CDN for assets |
| Security | Role-based access, input validation, CSP |

---

## Related Documents

- [MVP](MVP.md) - Minimum Viable Product scope
- [Tech Stack](Tech%20Stack.md) - Technology choices
- [Frontend UI](Frontend%20UI.md) - UI specifications
- [Folder Structure](Folder%20Structure.md) - Project organization
- [Implementation Plan](Implementation%20Plan.md) - Development timeline
