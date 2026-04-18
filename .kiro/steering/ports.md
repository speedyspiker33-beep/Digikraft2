---
inclusion: always
---

# DigiKraft Port Rules

These ports are fixed and must never be changed:

| Service | Port | URL | Start Command |
|---|---|---|---|
| Admin Panel | **3000** | http://localhost:3000 | `python -m http.server 3000` (in `digikraft.shop/frontend/src/admin`) |
| Main Website | **3001** | http://localhost:3001 | `npm run dev` (in `digikraft.shop/main-website`) |
| Backend API | **8080** | http://localhost:8080 | `node server.js` (in `digikraft.shop/backend`) |
| Strapi CMS | **1337** | http://localhost:1337/admin | `npm run develop` (in `digikraft.shop/cms`) |

## Rules
- NEVER suggest running the main website on port 3000 — that is the admin panel port
- NEVER suggest running the admin panel on port 3001 — that is the main website port
- The main website `nuxt.config.ts` has `devServer: { port: 3001 }` hardcoded
- When starting the main website, just run `npm run dev` — port 3001 is automatic
- When starting the admin panel, run `python -m http.server 3000` in the admin folder
