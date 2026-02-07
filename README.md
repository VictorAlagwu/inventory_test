# Tiny Inventory

Full-stack inventory management app that tracks stores and the products they carry, with filtering, pagination, and aggregated inventory insights.

## Run Instructions

```bash
docker compose up --build
```

Open `http://localhost:3000` to use the app.
The database is automatically migrated and seeded with sample data (5 stores, 10 categories, 60+ products).

To stop: `docker compose down`
To reset data: `docker compose down -v`

## API Sketch

```
GET    /api/v1/stores                       List stores (filterable by name)
POST   /api/v1/stores                       Create store
GET    /api/v1/stores/:id/summary           Inventory summary (aggregated value, low-stock count)
GET    /api/v1/stores/:storeId/products     List / add / update / remove products in a store
GET    /api/v1/products?categoryId&minPrice&maxPrice&page&limit&sortBy  Filtered + paginated list
POST   /api/v1/products                     Create product
GET    /api/v1/products/:id/availability    Product stock across all stores
GET    /api/v1/categories                   List categories
```

All responses follow the [JSend](https://github.com/omniti-labs/jsend) specification: `{ status, data }` for success, `{ status, data: { message, code } }` for errors.

## Decisions & Trade-offs

**Fastify over Express** — I went with Fastify for its performance and plugin architecture. The big win for this project is `app.inject()`, which lets me write integration tests without spinning up a real HTTP server.

**PostgreSQL + Prisma** — The data is relational (stores, products, categories, plus a many-to-many join), so PostgreSQL was a natural fit. Prisma gives me type-safe queries and a clean migration system. I considered SQLite for simplicity but wanted to show real-world patterns like connection pooling, unique constraints, and cascade deletes.

**Separate `store_products` join table** — Instead of putting quantity directly on the product, I used a join table with a composite unique on `(store_id, product_id)`. The same product can exist across multiple stores with independent stock levels, which is how real inventory works and what makes the summary/availability endpoints possible.

**Zod for validation** — Handles runtime schema validation with TypeScript type inference. Validation errors get caught globally and returned as structured 400 responses with field-level details, so the frontend always gets clear error messages.

**JSend response format** — Every endpoint returns `{ status, data }`. The frontend checks `status === 'success'` uniformly instead of handling different error shapes per route.

**TanStack Query** — Manages server state (caching, refetching, invalidation on mutations) so I don't need Redux or manual loading/error state tracking in components.

**Layered architecture (Controller → Service → Repository)** — Controllers handle HTTP + validation, services own business logic and throw typed errors, repositories wrap Prisma. Each layer can be tested or swapped independently.

**Frontend** — Covers list and detail views for stores and products, with loading/error/empty states and confirmation dialogs for deletes. I leaned slightly toward the backend since the assignment emphasizes API design and data modeling.

## Testing Approach

I went with **integration tests** that hit the full stack (HTTP → controller → service → repository → PostgreSQL) rather than unit tests with mocks. Mocking each layer would require a lot of boilerplate for limited benefit at this scale, and integration tests catch the bugs that actually matter: bad queries, constraint violations, wrong status codes.

Fastify's `app.inject()` keeps them fast since there's no real HTTP overhead.

The suite covers:

- CRUD for stores and products, including validation (negative prices, missing fields) and conflicts (duplicate names → 409)
- Filtering and pagination on the products list (category, price range, sorting, combined filters)
- Non-trivial operations: store inventory summary and product availability across stores
- Edge cases: empty stores, unassigned products, 404s

Tests run against a **separate database** (`inventory_test`) so they don't wipe dev data. The setup throws if `DATABASE_URL` doesn't contain `_test`. Tables are truncated between tests for isolation.

```bash
# First-time setup: create the test database and run migrations
createdb inventory_test
cd server && DATABASE_URL="postgresql://user:password@localhost:5432/inventory_test?schema=public" yarn prisma migrate deploy

# Run tests
cd server && yarn test
```

## If I Had More Time

- **Frontend tests** — React Testing Library for component-level tests, Playwright for E2E flows (create → edit → delete).
- **Search debouncing + optimistic updates** — Store search fires on every keystroke right now. Debouncing would cut unnecessary API calls. Optimistic updates would make quantity changes feel instant.
- **Rate limiting and caching** — Rate limiting middleware to prevent abuse, plus Redis or HTTP cache headers for store summaries and product lists.

---

## Tech Stack

- **Backend:** Fastify 5, TypeScript, Prisma 7, Zod, PostgreSQL
- **Frontend:** React 19, TypeScript, MUI, TanStack Query, React Router, Tailwind CSS
- **Infrastructure:** Docker Compose, nginx

## Project Structure

```
server/          Fastify API (port 3001)
web/             React SPA (port 3000 via nginx)
docker-compose.yml
```

## Architecture

```mermaid
graph LR
  Browser["Browser"]

  subgraph Docker Compose
    Nginx["Frontend\n(nginx :3000)"]
    API["Fastify API\n(:3001)"]
    DB[("PostgreSQL\n(:5432)")]
  end

  Browser -->|Static files| Nginx
  Browser -->|REST /api/v1| API
  API -->|Prisma| DB
```

## Data Model

```mermaid
erDiagram
  categories {
    int id PK
    varchar name UK
    timestamp created_at
    timestamp updated_at
  }

  stores {
    int id PK
    varchar name UK
    varchar location
    varchar description
    timestamp created_at
    timestamp updated_at
  }

  products {
    int id PK
    varchar name
    varchar description
    int category_id FK
    float price
    timestamp created_at
    timestamp updated_at
  }

  store_products {
    int id PK
    int store_id FK
    int product_id FK
    int quantity
    timestamp created_at
    timestamp updated_at
  }

  categories ||--o{ products : "has many"
  stores ||--o{ store_products : "has many"
  products ||--o{ store_products : "stocked in"
```

## Local Development

<details>
<summary>Manual setup (without Docker)</summary>

### Prerequisites

- Node.js 20+
- Yarn
- PostgreSQL 16+

### Database

```bash
createdb inventory
```

### Backend

```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL

yarn install
yarn prisma generate
yarn prisma migrate dev
yarn prisma:seed
yarn dev
```

API runs at `http://localhost:3001/api/v1`.

### Frontend

```bash
cd web
cp .env.example .env
# VITE_BACKEND_API=http://localhost:3001/api/v1

yarn install
yarn dev
```

Opens at `http://localhost:5173`.

</details>

## Full API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/stores` | List stores |
| POST | `/api/v1/stores` | Create store |
| GET | `/api/v1/stores/:id` | Get store |
| PUT | `/api/v1/stores/:id` | Update store |
| DELETE | `/api/v1/stores/:id` | Delete store |
| GET | `/api/v1/stores/:id/summary` | Store inventory summary |
| GET | `/api/v1/stores/:storeId/products` | List store products |
| POST | `/api/v1/stores/:storeId/products` | Add product to store |
| PUT | `/api/v1/stores/:storeId/products/:productId` | Update quantity |
| DELETE | `/api/v1/stores/:storeId/products/:productId` | Remove from store |
| GET | `/api/v1/products` | List products (filtered, paginated) |
| POST | `/api/v1/products` | Create product |
| GET | `/api/v1/products/:id` | Get product |
| PUT | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |
| GET | `/api/v1/products/:id/availability` | Product availability across stores |
