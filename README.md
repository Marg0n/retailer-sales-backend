# Retailer Sales Backend

A backend API for managing retailers, sales representatives, assignments, authentication, and bulk retailer import using CSV.

### **Retailer Sales Representative App**

**Goal:** Build the backend for an app that helps Sales Representatives (SRs) sell products to retailers across Bangladesh. Each SR is assigned to a small list of ~70 retailers from a nationwide pool of ~1 million. The backend should focus on **data modeling, performance, and scalability.**

## Features

- JWT-based authentication
- Retailer listing and retailer details
- Retailer update API
- Bulk retailer assignment to sales reps
- CSV retailer import
- PostgreSQL with Prisma ORM
- Redis support
- Dockerized services

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- JWT
- Docker / Docker Compose
- Postman

---

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/Marg0n/retailer-sales-backend.git
```

```bash
cd retailer-sales-backend
```

## Configure environment

Create a `.env` file:

```bash

PORT=5001
NODE_ENV =production

DATABASE_URL=postgresql://postgres:postgres@localhost:5433/retailer_db


JWT_SECRET=supersecret
REDIS_URL=redis://localhost:6379
```

## Setup

```bash
npm install
```

---

## Docker

### Option 1: Local development

Start PostgreSQL and Redis with Docker:

<!-- ```bash
docker compose up --build
``` -->

```bash
docker compose up -d postgres redis
```

Run migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed database:

```bash
npm run seed
```

Run the API:

```bash
npm run dev
```

Optional Prisma Studio:

```bash
npx prisma studio
```

---

### Option 2: Full Docker run

```bash
docker compose up -d
```

#### Port details:

API runs on http://localhost:5001
PostgreSQL runs on port 5433
Redis runs on port 6379

---

## Default Seed Users

`Admin`

Email:

```bash
admin@example.com
```

```bash
Password: admin123
```

`Sales Rep`

Email:

```bash
sr1@example.com
```

```bash
Password: sr123
```

---

## API Endpoints

### Authentication

`POST` /auth/login

Login and receive JWT token.

Example request:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Retailers

`GET` /retailers
Get all retailers.

`GET` /retailers/:uid
Get retailer details by UID.

`PUT` /retailers/:uid
Update retailers' allowed information.

Example request:

```json
{
  "points": 150,
  "routes": "Route B",
  "notes": "Some note here!"
}
```

### Admin


### **Hierarchy Management**
The system follows a geographical hierarchy: **Region > Area > Territory**. Distributors are also managed as independent entities for assignment.

#### **Region APIs**
- `POST /api/regions` - Create a new region.
- `GET /api/regions` - List all regions.
- `PUT /api/regions/:id` - Update region name.
- `DELETE /api/regions/:id` - Remove a region.

#### **Area APIs** (Belongs to a Region)
- `POST /api/areas` - Create area (requires `regionId`).
- `GET /api/areas` - List all areas with their parent region data.
- `PUT /api/areas/:id` - Update area details.
- `DELETE /api/areas/:id` - Remove an area.

#### **Territory APIs** (Belongs to an Area)
- `POST /api/territories` - Create territory (requires `areaId`).
- `GET /api/territories` - List all territories with area details.
- `PUT /api/territories/:id` - Update territory details.
- `DELETE /api/territories/:id` - Remove a territory.

#### **Distributor APIs**
- `POST /api/distributors` - Register a new distributor.
- `GET /api/distributors` - List all distributors.
- `PUT /api/distributors/:id` - Update distributor info.
- `DELETE /api/distributors/:id` - Remove a distributor.

### **Retailer & Operations**
- `POST /api/retailers/import` - Bulk import retailers via CSV file (uses `multer`).
- `POST /api/assignments/bulk` - Bulk assign retailers to Sales Representatives.


Example request:

```json
{
  "salesRepId": 1,
  "retailerUids": ["RTL-001", "RTL-002", "RTL-003"]
}
```


---

## Data Structure Example (JSON)

**Area Creation:**
```json
{
  "name": "Dhaka North",
  "regionId": 1
}
```

---

## Postman Collection

Included endpoints:

- `POST` /auth/login
- `GET` /retailers
- `GET` /retailers/:uid
- `PUT` /retailers/:uid
- `POST` /admin/import
- `POST` /admin/assignments/bulk

### Recommended Postman environment variables:

- baseUrl
- token
- uid

---

## Scaling Approach for Backend

The backend is designed to scale efficiently with horizontal deployments. It uses `PostgreSQL` with `Prisma` for optimized queries and `Redis` caching to reduce repeated database calls. Batch operations like CSV imports and bulk assignments are parallelized for large datasets.

Being stateless with `JWT authentication`, multiple instances can run behind a load balancer. Endpoints support pagination, filtering, and search to prevent overload. Containerization with `Docker` ensures consistent deployments and smooth scaling.