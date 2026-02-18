# Frontend UI

UI specifications and component library for the customer-facing website.

## Table of Contents

- [Design Tokens](#design-tokens)
- [Component Library](#component-library)
- [Page Layouts](#page-layouts)
- [Page Templates](#page-templates)
- [Responsive Design](#responsive-design)
- [Animation Specifications](#animation-specifications)

---

## Design Tokens

### Colors

```css
--color-primary: #2563EB;
--color-primary-hover: #1D4ED8;
--color-primary-light: #EFF6FF;
--color-background: #FFFFFF;
--color-surface: #F9FAFB;
--color-border: #E5E7EB;
--color-text-primary: #111827;
--color-text-secondary: #6B7280;
--color-text-muted: #9CA3AF;
--color-success: #10B981;
--color-warning: #F59E0B;
--color-danger: #EF4444;
```

### Typography

```css
--font-family: 'Inter', sans-serif;
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-2xl: 32px;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-8: 48px;
--space-10: 64px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
```

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-full: 9999px;
```

---

## Component Library

### Button

```html
<!-- Primary -->
<button class="btn btn-primary">Shop Now</button>

<!-- Secondary/Outline -->
<button class="btn btn-secondary">Learn More</button>

<!-- Ghost -->
<button class="btn btn-ghost">Cancel</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
```

**CSS:**
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-primary);
}
```

### Product Card

```html
<div class="product-card">
  <div class="product-image">
    <img src="product.jpg" alt="Product Name">
    <span class="badge badge-sale">-20%</span>
  </div>
  <div class="product-info">
    <h3 class="product-title">Product Name</h3>
    <p class="product-category">Category</p>
    <div class="product-price">
      <span class="price-sale">$29.00</span>
      <span class="price-original">$39.00</span>
    </div>
    <button class="btn btn-primary btn-add-cart">Add to Cart</button>
  </div>
</div>
```

**CSS:**
```css
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
}

.product-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.product-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 20px;
}

.product-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
}

.price-sale {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}

.price-original {
  font-size: 16px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}
```

### Cart Drawer

```html
<div class="cart-drawer" id="cartDrawer">
  <div class="cart-header">
    <h2>Your Cart (3)</h2>
    <button class="btn-close">×</button>
  </div>
  <div class="cart-items">
    <div class="cart-item">
      <img src="thumb.jpg" alt="Product">
      <div class="cart-item-details">
        <h4>Product Name</h4>
        <p>From: CorelDRAW Hub</p>
        <div class="quantity-controls">
          <button>-</button>
          <span>1</span>
          <button>+</button>
        </div>
      </div>
      <div class="cart-item-price">$29.00</div>
    </div>
  </div>
  <div class="cart-footer">
    <div class="cart-total">
      <span>Total</span>
      <span class="total-amount">$87.00</span>
    </div>
    <button class="btn btn-primary btn-checkout">Checkout</button>
    <button class="btn btn-ghost btn-continue">Continue Shopping</button>
  </div>
</div>
```

### Form Elements

```html
<div class="form-group">
  <label class="form-label">Email Address</label>
  <input 
    type="email" 
    class="form-input" 
    placeholder="you@example.com"
    required
  >
</div>

<div class="form-group">
  <label class="form-label">Password</label>
  <div class="input-with-icon">
    <input 
      type="password" 
      class="form-input" 
      placeholder="••••••••"
    >
    <button class="btn-toggle-password">
      <i class="icon-eye"></i>
    </button>
  </div>
</div>
```

**CSS:**
```css
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
```

---

## Page Layouts

### Header

```html
<header class="site-header">
  <div class="header-container">
    <a href="/" class="logo">
      <img src="logo.svg" alt="DigiKraft">
    </a>
    
    <nav class="main-nav">
      <a href="/shop">Shop</a>
      <div class="dropdown">
        <button>Hubs</button>
        <div class="dropdown-menu">
          <a href="/coreldraw">CorelDRAW Hub</a>
          <a href="/ai-lab">AI Workflow Lab</a>
        </div>
      </div>
      <a href="/about">About</a>
    </nav>
    
    <div class="header-actions">
      <button class="btn-search">
        <i class="icon-search"></i>
      </button>
      <button class="btn-cart" data-count="3">
        <i class="icon-cart"></i>
      </button>
      <a href="/account" class="btn-account">
        <i class="icon-user"></i>
      </a>
    </div>
  </div>
</header>
```

### Footer

```html
<footer class="site-footer">
  <div class="footer-container">
    <div class="footer-brand">
      <img src="logo.svg" alt="DigiKraft">
      <p>Your digital marketplace for creative tools</p>
    </div>
    
    <div class="footer-links">
      <div class="link-group">
        <h4>Shop</h4>
        <a href="/shop">All Products</a>
        <a href="/coreldraw">CorelDRAW Hub</a>
        <a href="/ai-lab">AI Workflow Lab</a>
      </div>
      
      <div class="link-group">
        <h4>Support</h4>
        <a href="/help">Help Center</a>
        <a href="/contact">Contact Us</a>
        <a href="/faq">FAQ</a>
      </div>
      
      <div class="link-group">
        <h4>Legal</h4>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>© 2024 DigiKraft. All rights reserved.</p>
      <div class="social-links">
        <a href="#"><i class="icon-twitter"></i></a>
        <a href="#"><i class="icon-instagram"></i></a>
        <a href="#"><i class="icon-youtube"></i></a>
      </div>
    </div>
  </div>
</footer>
```

---

## Page Templates

### Homepage

**Sections:**
1. **Hero** - Large banner with CTA
2. **Featured Products** - Grid of 4-6 products
3. **Satellite Pages** - Cards linking to hubs
4. **Categories** - Visual category grid
5. **Testimonials** - Customer reviews
6. **Newsletter** - Email signup

### Product Grid (Shop)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Header with search + filters               │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Product Grid                    │
│ Filters  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│          │  └────┘ └────┘ └────┘ └────┘    │
│          │  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│          │  └────┘ └────┘ └────┘ └────┘    │
│          │                                  │
│          │  [Pagination]                    │
└──────────┴──────────────────────────────────┘
```

### Product Detail

**Basic Mode:**
- Large product image (left)
- Title, price, description (right)
- Add to cart button
- Related products (bottom)

**Landing Page Mode:**
- Full-width hero with product
- Feature sections with images
- Testimonials
- Pricing cards
- FAQ section
- Strong CTA sections

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */

/* Small devices (phones) */
@media (min-width: 640px) { 
  .container { padding: 0 24px; }
}

/* Medium devices (tablets) */
@media (min-width: 768px) { 
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Large devices (desktops) */
@media (min-width: 1024px) { 
  .product-grid { grid-template-columns: repeat(3, 1fr); }
  .sidebar { display: block; }
}

/* Extra large devices */
@media (min-width: 1280px) { 
  .product-grid { grid-template-columns: repeat(4, 1fr); }
}
```

### Mobile Navigation

```css
@media (max-width: 1023px) {
  .main-nav {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .sidebar {
    display: none;
  }
  
  .filter-button {
    display: block;
  }
}
```

---

## Animation Specifications

### Fade In

```css
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

### Slide In

```css
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
```

### Cart Drawer

```css
.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease-out;
}

.cart-drawer.open {
  transform: translateX(0);
}
```

### Hover Effects

```css
/* Card hover */
.product-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* Button hover */
.btn {
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

/* Image zoom */
.product-image img {
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}
```

---

## Icon System

Use **Lucide Icons** or **Heroicons** (24px default, 20px small)

### Navigation Icons

| Icon | Name | Usage |
|:-----|:-----|:------|
| 🔍 | search | Search button |
| 🛒 | shopping-cart | Cart |
| 👤 | user | Account |
| ✕ | x | Close button |
| ☰ | menu | Mobile menu |

### Action Icons

| Icon | Name | Usage |
|:-----|:-----|:------|
| + | plus | Add quantity |
| - | minus | Remove quantity |
| ♡ | heart | Wishlist |
| ↓ | download | Download |
| → | arrow-right | CTA arrows |

---

## Stitch Handoff Notes

Stitch generates visual templates. Implementation must:

1. Extract exact hex codes, spacing values, font sizes
2. Map to design tokens above
3. Build components to match pixel-perfect
4. Maintain consistent naming (sidebar always "sidebar", not "nav" in one place)
5. Filter visibility by role, don't duplicate components

---

## Related Documents

- [Backend UI](Backend%20UI.md) - Admin panel UI specifications
- [System Architecture](System%20Architecture.md) - System connections
- [Web Flow](Web%20Flow.md) - User flows
- [Folder Structure](Folder%20Structure.md) - Component organization
