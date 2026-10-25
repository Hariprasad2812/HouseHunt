# HouseHunt — Rental homes in Bengaluru

A production-quality rental marketplace demo, built end to end:

- **Frontend** — React 18 + Vite, React Router, Framer Motion + GSAP, Leaflet (react-leaflet), Tailwind CSS, Recharts, Lucide icons.
- **Backend** — Java 21, Spring Boot 3.3, Spring Data JPA / Hibernate, Spring Security + JWT, layered architecture (controller → service → repository → entity + dto / exception / config / security / util).
- **Database** — MySQL 8 schema (users, properties, images, locations, amenities, favorites, applications, visits, messages, reviews, notifications). Dev runs on embedded H2 in MySQL mode for zero-setup demos; the `mysql` profile targets real MySQL (see `docker-compose.yml`).

```
househunt/
├── frontend/          # Vite + React app (src/)
├── backend/           # Spring Boot API (src/main/java/com/househunt)
├── db/                # schema notes / asset lists
├── docs/              # (project notes)
└── postman/           # HouseHunt.postman_collection.json
```

## Run it

**Backend**
```bash
cd backend
mvn spring-boot:run        # dev profile: H2 in-memory (MySQL mode), auto-seeded
# or: mvn -Dspring-boot.run.profiles=mysql spring-boot:run   (needs MySQL up)
```
The API starts on `http://localhost:8080`. On boot it seeds ~10 Bengaluru neighbourhoods, 26 properties, demo users, applications, visits, messages and reviews.

**Frontend**
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```
The Vite dev server proxies `/api` and `/uploads` to the backend, so the app runs against one origin.

### Demo accounts (password: `HouseHunt@123`)
| Role  | Email               | Lands on   |
|-------|---------------------|------------|
| Tenant| `tenant@househunt.in` | `/tenant` |
| Owner | `aditi@househunt.in`  | `/owner`  |
| Admin | `admin@househunt.in`  | `/admin`  |

One-tap demo logins are shown on the login page.

## Product surface

- **Discovery** — cinematic hero with working search; full results page with filters (neighbourhood, type, furnishing, rent range, bedrooms/bathrooms, amenities, availability), sorting (price ↑↓, newest), and pagination; editorial "featured homes"; neighbourhood explorer with per-area guides; an interactive map fed from live listings; a type index with live counts.
- **Listing detail** — gallery with thumbnails + fullscreen, amenities, deposit/maintenance notes, an area map, verified-owner panel, reviews, and a sticky "Schedule a visit".
- **List your property** — a 7-step flow with progress, validation, draft persistence (localStorage), image uploads (`POST /api/uploads/images`), pricing suggestions, amenity toggles and a live preview; submissions enter the admin verification queue.
- **Accounts** — register/login (JWT), role-based routing and guards.
- **Dashboards** (standalone apps, no marketing chrome):
  - *Tenant* `/tenant` — overview stats, saved homes, applications, visit requests (book/cancel), messages inbox, profile.
  - *Owner* `/owner` — portfolio, listings table (pause/publish), application pipeline (shortlist/approve/reject), viewing-request calendar (confirm/decline/complete), 6-month demand analytics (Recharts), messages, profile.
  - *Admin* `/admin` — platform overview, all-listings table filtered by status (approve/suspend/feature/delete), verification queue, user management (suspend/restore/delete), neighbourhood market report and review moderation.
- **Content & trust** — How it works, About + contact, Terms / Privacy, neighbourhood editorial sections; 404 page; verification counters.

## API quick map

Full export with sample bodies lives in [`postman/HouseHunt.postman_collection.json`](postman/HouseHunt.postman_collection.json) (import into Postman, run *Login* first to capture the JWT).

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/auth/me`, `PUT /api/auth/me/password` |
| Directory | `GET /api/locations`, `GET /api/amenities`, `GET /api/properties` (paged search + filters), `GET /api/properties/featured`, `GET /api/properties/{id}` |
| Engagement | `POST /api/properties/{id}/favorite`, `POST …/visits`, `POST …/applications`, `POST …/reviews`, `GET/PUT /api/visits|applications`, `GET/POST /api/messages`, `GET /api/notifications` |
| Dashboards | `GET /api/dashboards/tenant`, `GET /api/dashboards/owner` |
| Owner | `GET/POST /api/properties`, `PUT /api/owner/properties/{id}/pause|publish`, `GET /api/owner/applications|visits`, `PUT …/{id}`, `GET /api/owner/analytics` |
| Admin | `GET /api/admin/overview|users|properties|moderation|reports/locations|reviews/pending`, `PUT /api/admin/users/{id}/active`, `PUT /api/admin/properties/{id}/status|feature`, `PUT /api/admin/reviews/{id}/moderate` |

## Notes on craft

- Editorial identity: warm paper ground, ink type (DM Serif Display for display, Inter for UI), a single clay accent, hairline borders, asymmetric grids. No template gradients or stock "handshake" imagery — photography is architectural Unsplash work consistent across every surface.
- Motion (Framer Motion + GSAP) is transform/opacity only and disabled under `prefers-reduced-motion`.
- Mobile is laid out separately (drawer navs, dashboards with hamburger menu, sticky search CTA, scroll-snap map rows).
- Code-split routes, lazy `<img>` with srcsets, skeletons, empty/error states, a styled 404.

> Two sample scripts for headless QA live in `e2e/` (Playwright): `smoke.mjs` walks every public route and all three dashboards asserting zero console/page errors; `overflow.mjs` asserts no horizontal overflow at 390px and 1440px.
