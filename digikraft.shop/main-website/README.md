# DigiKraft Main Website

The customer-facing e-commerce storefront for DigiKraft.shop built with Nuxt 3, Vue 3, and Tailwind CSS.

## 🚀 Features

- **Modern Stack**: Nuxt 3 + Vue 3 Composition API + TypeScript
- **State Management**: Pinia stores for cart, auth, and products
- **Responsive Design**: Mobile-first with Tailwind CSS
- **E-commerce Features**: Shopping cart, product browsing, checkout flow
- **Satellite Hubs**: CorelDRAW Hub, AI Workflow, Design Arsenal
- **SEO Optimized**: Server-side rendering with meta tags
- **Testing**: Vitest for unit tests, Playwright for E2E

## 📁 Project Structure

```
main-website/
├── assets/
│   └── css/
│       └── main.css          # Tailwind CSS + custom styles
├── components/
│   ├── layout/               # Layout components
│   │   ├── TopBar.vue
│   │   ├── Header.vue
│   │   ├── Nav.vue
│   │   ├── Footer.vue
│   │   └── CartDrawer.vue
│   ├── product/              # Product components
│   │   └── ProductCard.vue
│   └── sections/             # Homepage sections
│       ├── Hero.vue
│       ├── FeaturedProducts.vue
│       ├── HubCards.vue
│       ├── FeaturesBar.vue
│       └── Newsletter.vue
├── layouts/
│   └── default.vue           # Main layout
├── pages/
│   └── index.vue             # Homepage
├── stores/
│   ├── cart.ts               # Shopping cart state
│   ├── auth.ts               # Authentication state
│   └── products.ts           # Products state
├── types/
│   └── index.ts              # TypeScript types
├── app.vue                   # App root
├── nuxt.config.ts            # Nuxt configuration
└── tailwind.config.ts        # Tailwind configuration
```

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure API endpoint:**
   Edit `.env` and set your backend API URL:
   ```
   NUXT_PUBLIC_API_BASE=http://localhost:8080/api
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

   The site will be available at `http://localhost:3000`

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

The application is configured for deployment to Vercel or Netlify:

1. Connect your repository
2. Set environment variables
3. Deploy!

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
colors: {
  primary: '#2563eb',      // Main brand color
  'background-light': '#ffffff',
  'background-dark': '#f9fafb',
  'text-main': '#111827',
  'text-muted': '#6b7280'
}
```

### Fonts

The site uses Inter from Google Fonts. To change fonts, edit `nuxt.config.ts`:

```typescript
link: [
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=YourFont&display=swap' }
]
```

## 🔌 API Integration

The site connects to a Java Spring Boot backend. API endpoints:

- `GET /api/public/products` - List products
- `GET /api/public/products/:id` - Product details
- `GET /api/public/categories` - Categories
- `POST /api/customer/login` - User login
- `POST /api/customer/register` - User registration
- `POST /api/public/newsletter` - Newsletter subscription

## 📝 Components

### ProductCard

Display product information with add-to-cart functionality:

```vue
<ProductProductCard 
  :product="product"
  size="large"
  show-badge
/>
```

### CartDrawer

Slide-in shopping cart accessible from header:

```vue
<LayoutCartDrawer />
```

## 🗂️ Stores

### Cart Store

```typescript
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
cartStore.addItem(product, quantity)
cartStore.removeItem(productId)
cartStore.updateQuantity(productId, quantity)
```

### Auth Store

```typescript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
await authStore.login(email, password)
await authStore.register(name, email, password)
authStore.logout()
```

### Products Store

```typescript
import { useProductsStore } from '~/stores/products'

const productsStore = useProductsStore()
await productsStore.fetchProducts()
await productsStore.fetchCategories()
productsStore.setFilter('category', categoryId)
```

## 🚧 TODO

- [ ] Product detail page
- [ ] Product listing page with filters
- [ ] Checkout flow
- [ ] User account pages
- [ ] Satellite hub pages
- [ ] Search functionality
- [ ] Payment gateway integration
- [ ] Order management
- [ ] Reviews and ratings

## 📄 License

Proprietary - DigiKraft.shop

## 🤝 Contributing

This is a private project. For questions, contact the development team.
