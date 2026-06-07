# Multi-tenant SaaS API

A production-grade **multi-tenant REST API** built with NestJS, PostgreSQL and Stripe, designed as a portfolio project to demonstrate **Clean Architecture**, **SOLID principles**, and the ability to build scalable SaaS infrastructure.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENTS (HTTP)                           │
│         curl / Postman / Frontend App                        │
└────────────────────────┬─────────────────────────────────────┘
                         │ X-Tenant-ID: acme (header)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    NestJS API (:3000)                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              TenantInterceptor                       │    │
│  │   Extracts tenant from X-Tenant-ID or subdomain     │    │
│  └──────────────────┬──────────────────────────────────┘    │
│                     │                                        │
│  ┌──────────────────▼──────────────────────────────────┐    │
│  │   JwtAuthGuard → RolesGuard → Controller → Service  │    │
│  │                                                      │    │
│  │  ┌──────────┐ ┌─────────┐ ┌────────┐ ┌─────────┐  │    │
│  │  │  Auth    │ │Tenants  │ │ Users  │ │Billing  │  │    │
│  │  │  Module  │ │ Module  │ │ Module │ │ Module  │  │    │
│  │  └──────────┘ └─────────┘ └────────┘ └─────────┘  │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌───────────────┐  ┌──────────┐
│ PostgreSQL  │  │    Stripe     │  │  JWT     │
│             │  │   Test API    │  │  Tokens  │
│ public      │  └───────────────┘  └──────────┘
│ ├ users     │
│ ├ tenants   │
│ └ plans     │
│             │
│ tenant_acme │   ← Schema isolated per tenant
│ tenant_globex│
└─────────────┘
```

### Multi-tenancy Strategy

Each tenant gets its own **PostgreSQL schema** (e.g., `tenant_acme`, `tenant_globex`). The `TenantInterceptor` reads the `X-Tenant-ID` header (or extracts it from the subdomain) on every request and attaches it to the request context. Services can then scope queries to the correct schema using `SET search_path`.

---

## Tech Stack

| Layer          | Technology                    |
|----------------|-------------------------------|
| Framework      | NestJS 10 + TypeScript strict |
| Database       | PostgreSQL 16 + TypeORM 0.3   |
| Auth           | JWT (access + refresh tokens) |
| Payments       | Stripe API (test mode)        |
| Validation     | class-validator + Joi         |
| Docs           | Swagger / OpenAPI 3.0         |
| Container      | Docker + docker-compose       |
| Testing        | Jest                          |

---

## Project Structure

```
src/
├── modules/
│   ├── auth/               # JWT auth, register, login, refresh
│   ├── tenants/            # Tenant CRUD + schema provisioning
│   ├── users/              # User management with RBAC
│   ├── billing/            # Stripe customers, subscriptions, webhooks
│   └── plans/              # SaaS plan catalog
├── common/
│   ├── decorators/         # @CurrentUser, @Roles, @Public, @TenantId
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── interceptors/       # TenantInterceptor
│   ├── filters/            # GlobalExceptionFilter
│   └── dto/                # PaginationDto + paginate helper
├── config/                 # Joi env validation schema
└── database/               # TypeORM config + TenantDataSourceService
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & docker-compose
- A Stripe test account (free at stripe.com)

### 1. Clone and install

```bash
git clone https://github.com/GuilleMG10/api-multitenant.git
cd api-multitenant
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (min 32 chars each)
- `STRIPE_SECRET_KEY` — your Stripe test secret key (`sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen` CLI output

### 3. Start the database

```bash
docker-compose up postgres -d
```

### 4. Run the API

```bash
# Development (with hot-reload)
npm run start:dev

# Production (Docker)
docker-compose up --build
```

### 5. Access Swagger docs

Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## API Endpoints

### Auth (Public)
| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| POST   | /api/v1/auth/register | Register new user              |
| POST   | /api/v1/auth/login    | Login → returns JWT tokens     |
| POST   | /api/v1/auth/refresh  | Refresh access token           |
| POST   | /api/v1/auth/logout   | Invalidate refresh token       |

### Tenants (SUPER_ADMIN only)
| Method | Endpoint                | Description                       |
|--------|-------------------------|-----------------------------------|
| POST   | /api/v1/tenants         | Create tenant + provision schema  |
| GET    | /api/v1/tenants         | List tenants (paginated)          |
| GET    | /api/v1/tenants/:id     | Get tenant details                |
| PATCH  | /api/v1/tenants/:id     | Update tenant                     |
| DELETE | /api/v1/tenants/:id     | Delete tenant + drop schema       |

### Users (authenticated)
| Method | Endpoint             | Description                     |
|--------|----------------------|---------------------------------|
| POST   | /api/v1/users        | Create user (ADMIN+)            |
| GET    | /api/v1/users        | List users (tenant-scoped)      |
| GET    | /api/v1/users/:id    | Get user by ID                  |
| PATCH  | /api/v1/users/:id    | Update user                     |
| DELETE | /api/v1/users/:id    | Delete user (ADMIN+)            |

### Billing (SUPER_ADMIN / ADMIN)
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| POST   | /api/v1/billing/customers/:tenantId   | Create Stripe customer       |
| POST   | /api/v1/billing/subscriptions/:id     | Assign a paid plan           |
| POST   | /api/v1/billing/subscriptions/:id/cancel | Cancel subscription       |
| GET    | /api/v1/billing/portal/:tenantId      | Get billing portal URL       |
| POST   | /api/v1/billing/webhook               | Stripe webhook (public)      |

### Plans (public GET, SUPER_ADMIN for mutations)
| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| GET    | /api/v1/plans        | List plans        |
| GET    | /api/v1/plans/:id    | Get plan details  |
| POST   | /api/v1/plans        | Create plan       |
| PATCH  | /api/v1/plans/:id    | Update plan       |
| DELETE | /api/v1/plans/:id    | Delete plan       |

---

## Example Requests

### Register and login

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"StrongP@ss123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"StrongP@ss123"}'
```

### Create a tenant (SUPER_ADMIN)

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Corp","subdomain":"acme","plan":"pro"}'
```

### Create a user inside a tenant

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-Tenant-ID: acme" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Smith","email":"jane@acme.com","password":"SecureP@ss456","role":"ADMIN"}'
```

### Testing Stripe webhooks locally

```bash
# Install Stripe CLI and listen
stripe listen --forward-to http://localhost:3000/api/v1/billing/webhook

# In another terminal, trigger a test event
stripe trigger invoice.paid
```

---

## User Roles

| Role         | Permissions                                               |
|--------------|-----------------------------------------------------------|
| SUPER_ADMIN  | Full access to all resources across all tenants           |
| ADMIN        | Manage users and billing within their tenant              |
| MEMBER       | Read-only access, can update their own profile            |

---

## Error Response Format

All errors are normalized by the `GlobalExceptionFilter`:

```json
{
  "statusCode": 404,
  "message": "Tenant uuid-xxx not found",
  "error": "Not Found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/tenants/uuid-xxx"
}
```

---

## Running Tests

```bash
# Unit tests
npm run test

# With coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## Environment Variables

| Variable               | Required | Description                        |
|------------------------|----------|------------------------------------|
| NODE_ENV               | No       | development / production / test    |
| PORT                   | No       | API port (default: 3000)           |
| DB_HOST                | Yes      | PostgreSQL host                    |
| DB_PORT                | No       | PostgreSQL port (default: 5432)    |
| DB_USERNAME            | Yes      | Database user                      |
| DB_PASSWORD            | Yes      | Database password                  |
| DB_DATABASE            | Yes      | Database name                      |
| JWT_ACCESS_SECRET      | Yes      | Min 32 chars                       |
| JWT_REFRESH_SECRET     | Yes      | Min 32 chars                       |
| JWT_ACCESS_EXPIRATION  | No       | Default: 15m                       |
| JWT_REFRESH_EXPIRATION | No       | Default: 7d                        |
| STRIPE_SECRET_KEY      | Yes      | sk_test_... from Stripe dashboard  |
| STRIPE_WEBHOOK_SECRET  | Yes      | whsec_... from stripe listen       |

---

## License

MIT
