# Retailer Sales Backend

A backend API for managing retailers, sales representatives, assignments, authentication, and bulk retailer import using CSV.

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
Update retailer information.

Example request:

```json
{
  "name": "Retailer One Updated",
  "phone": "01711111111",
  "points": 150,
  "routes": "Route B"
}
```

### Admin

`POST` /admin/import
Import retailers from CSV file.

Request type:
- multipart/form-data
- key: file


`POST` /admin/assignments/bulk
Bulk assign retailers to a sales representative.

Example request:
```json
{
  "salesRepId": 1,
  "retailerUids": ["RTL-001", "RTL-002", "RTL-003"]
}
```

---

## Postman Collection

Included endpoints:

`POST` /auth/login
`GET` /retailers
`GET` /retailers/:uid
`PUT` /retailers/:uid
`POST` /admin/import
`POST` /admin/assignments/bulk


### Recommended Postman environment variables:

- baseUrl
- token
- uid


