# Project Interface Contracts

## Authentication System

### API Contract
```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}
```

### Frontend Usage
```typescript
// apps/web/app/login/page.tsx
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const data: LoginResponse = await response.json();
```

### Status
- [ ] Backend API created (Claude)
- [ ] Frontend login page (OpenCode)
- [ ] Integration tested
- [ ] Error handling complete

---

## Product Catalog System

### API Contract
```typescript
// GET /api/products?page=1&category=electronics
interface ProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}
```

### Frontend Component
```typescript
// components/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}
```

### Status
- [ ] Backend API (Claude)
- [ ] Frontend components (OpenCode)
- [ ] Integration test

---

## How to Use This File

1. **Before starting work**, check which contracts exist
2. **Both AIs must agree** on the interface before coding
3. **Update status** as work progresses
4. **Test integration** once both sides complete
