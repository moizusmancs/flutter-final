# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start development server (TypeScript watch mode + nodemon)
npm run build    # Run compiled application from dist/index.js
```

Development uses `concurrently` to run TypeScript compiler in watch mode alongside nodemon watching dist/index.js for hot reload.

## Architecture Overview

Express.js 5.x backend for e-commerce/product management with layered architecture:

- **Controllers** (`src/controller/`) - Business logic, organized by domain (products, users, admin)
- **Routes** (`src/routes/`) - Express route definitions, mirrors controller structure
- **Middlewares** (`src/middlewares/`) - Request processing pipeline
- **Zod Schemas** (`src/zod/`) - Request validation schemas, mirrors route structure
- **Types** (`src/types/`) - TypeScript interfaces for domain entities
- **Utils** (`src/utils/`) - Shared helpers (DB queries, JWT, S3, custom errors)
- **Config** (`src/config/`) - Database and AWS S3 client configuration

## Key Patterns

**Request Flow:**
Route → Zod Validation Middleware → AsyncCall Wrapper → Controller → Global Error Handler

**Database Access:**
Raw MySQL2 queries via `queryDb<T>()` wrapper in `src/utils/queryDb.ts`. No ORM - uses parameterized queries for SQL injection prevention.

**Validation:**
Zod schemas validate request body/query/params. Middleware at `src/middlewares/zodValidate.middleware.ts` returns 400 with structured errors on failure.

**Error Handling:**
Custom error class (`src/utils/customError.ts`) with statusCode and optional errors array. Global handler returns consistent JSON: `{success, message, errors}`.

**Authentication:**
JWT tokens stored in HTTP-only cookies. Passwords hashed with bcrypt (10 salt rounds). Token generation in `src/utils/generateToken.ts`.

**File Uploads:**
AWS S3 presigned URLs with 5-minute expiry. Configuration in `src/config/aws.ts`, utilities in `src/utils/s3.utils.ts`.

## API Structure

Base URL: `/api/v1/[module]/[endpoint]`

- Auth: `/api/v1/users/auth/` (signup, login)
- Products: `/api/v1/products/` (public endpoints)
- Admin: `/api/v1/admin/` (categories, products, media management)

## Environment Variables

Required in `.env`:
- `PORT` - Server port (default: 4000)
- `JWT_SECRET` - JWT signing secret
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME` - S3 configuration

Database connection is configured directly in `src/config/mysql2.ts` (MySQL database: "vouge").

## TypeScript Configuration

- ES Modules (`"type": "module"` in package.json)
- Target: ES2022
- Module resolution: NodeNext
- Output directory: dist/
- Source maps enabled
