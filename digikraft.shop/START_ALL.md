# DigiKraft — Start All Services

## Quick Start (3 terminals)

### Terminal 1 — Backend API (port 8080)
```bash
cd digikraft.shop/backend
node server.js
```
→ http://localhost:8080

### Terminal 2 — Main Website (port 3001)
```bash
cd digikraft.shop/main-website
npm run dev
```
→ http://localhost:3001

### Terminal 3 — Admin Panel (port 3000)
```bash
cd digikraft.shop/frontend/src/admin
python -m http.server 3000
```
→ http://localhost:3000

---

## Admin Login
- Email: `admin@digikraft.shop`
- Password: `admin123`

## Data Flow
```
Admin Panel (3000) ──→ Backend API (8080) ──→ NeDB Database
Main Website (3001) ──→ Backend API (8080) ──→ NeDB Database
```

## Database
`digikraft.shop/backend/data/digikraft.db/` — NeDB flat files, no installation needed

## AI Key
OpenRouter key stored in `backend/.env` as `OPENROUTER_API_KEY`
Also saved in DB settings under key `openrouter_api_key`

## Key URLs
- Health: http://localhost:8080/health
- Admin login: POST http://localhost:8080/api/admin/login
- Products: http://localhost:8080/api/v1/products
- Public settings: http://localhost:8080/api/v1/settings/public
