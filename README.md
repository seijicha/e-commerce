# GlitchAttire — Heavyweight Cyberpunk & Distorted Streetwear

GlitchAttire is a full-stack apparel e-commerce web platform engineered with **Node.js (Express 4)**, **MySQL 8 (`mysql2/promise`)**, server-rendered **EJS (`express-ejs-layouts`)**, and a custom **Plain CSS Design System** using CSS custom properties.

---

## 1. Architectural Highlights

The platform adheres strictly to a 4-tier layered architecture: `routes → controllers → services → models`.

- **Server-Side Source of Truth:** All pricing math, subtotal calculations, and inventory stock limits are verified and computed on the server. Client-provided totals are never trusted.
- **Strict Role-Based Access Control:**
  - **Guests:** Can freely browse the homepage, catalog, and product details. Attempting to add items to cart, view cart, checkout, or inspect orders redirects to `/login?next=<path>`.
  - **Customers:** Self-registration enabled at `/register` and login at `/login`. Allowed to manage cart items, execute checkout, inspect their own order history, and cancel pending orders. Blocked from `/admin/*` (`403 Forbidden`).
  - **Administrators:** No public registration. Seeded via `npm run seed:admin` and authenticated at `/admin/login`. Admins manage products, categories, orders, and customers. Prohibited from shopping or cart access (`403 Forbidden`).
- **Transactional Integrity:** Checkout, stock decrements, and order cancellations run inside MySQL transactions with row-level locks (`SELECT ... FOR UPDATE`) to guarantee overselling prevention.
- **Audit Logging:** Every admin mutation (creation, edit, status change, deletion) and authentication event is logged to the `audit_logs` table via `AuditLogger` with automatic redaction of sensitive keys.
- **Progressive Enhancement:** Server-rendered HTML forms operate reliably via native `POST` and `method-override` (`?_method=`). Client-side JavaScript in `public/js/` acts purely as a progressive enhancement bound exclusively to `data-*` attributes.

---

## 2. Technology Stack

| Layer / Capability      | Technology                                            | Details                                                                               |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Runtime & Framework** | Node.js 20+ LTS / Express 4                           | Modular HTTP pipeline with route splitting                                            |
| **Database**            | MySQL 8.x via `mysql2/promise`                        | InnoDB engine, `utf8mb4_unicode_ci`, prepared statements                              |
| **Templating**          | EJS + `express-ejs-layouts`                           | Server-rendered templates, layouts (`main`, `admin`, `auth`), shared partials         |
| **Styling**             | Plain CSS (`public/css/`)                             | CSS custom properties (design tokens in `tokens.css`), dark cyberpunk aesthetic       |
| **Client Scripting**    | Vanilla JavaScript (ES modules)                       | `data-*` bound enhancements (quantity steppers, image previews, dialogs)              |
| **Session Store**       | `express-session` + `express-mysql-session`           | MySQL database sessions with MemoryStore test fallback                                |
| **Security & Auth**     | `helmet`, `csrf-csrf`, `express-rate-limit`, `bcrypt` | Secure headers, CSRF token validation, brute-force limiting, cost 12 password hashing |
| **File Uploads**        | `multer`                                              | Product image uploads (JPEG/PNG/WebP, max 2 MB, random UUID naming)                   |
| **Testing**             | Jest + Supertest                                      | Unit tests for domain services, integration tests for routes                          |
| **Code Quality**        | ESLint + Prettier                                     | Automated formatting and linting (0 warnings, 0 errors)                               |

---

## 3. Directory Layout

```
glitchattire/
├── app.js                       # Express app pipeline assembly
├── server.js                    # HTTP server listener
├── package.json
├── .env.example                 # Configuration blueprint
├── config/
│   ├── env.js                   # Validates environment configuration
│   ├── db.js                    # mysql2 connection pool
│   └── session.js               # Session + MySQL store setup
├── routes/
│   ├── index.js                 # Mounts all route groups
│   ├── public.routes.js         # /, /shop, /shop/:slug
│   ├── auth.routes.js           # /login, /register, /logout, /admin/login
│   ├── customer.routes.js       # /cart, /checkout, /orders, /account
│   └── admin/                   # /admin (dashboard, products, categories, orders, customers)
├── controllers/                 # Thin HTTP traffic directors
├── services/                    # Business rules, transactions & AuditLogger
├── models/                      # Parameterized SQL data access modules
├── validators/                  # express-validator rule chains
├── middleware/                  # Auth guards, upload, CSRF, rate limit, error handler
├── utils/                       # slugify, money, order-number, pagination
├── views/
│   ├── layouts/                 # main.ejs, admin.ejs, auth.ejs
│   ├── partials/                # header, footer, flash, product-card, pagination, form-field, confirm-delete
│   ├── pages/                   # Storefront views (entrypoints named index.ejs)
│   └── admin/                   # Admin console views
├── public/
│   ├── css/                     # tokens.css, base.css, layout.css, components.css, pages.css
│   ├── js/                      # main.js, quantity.js, image-preview.js, variants.js, confirm.js
│   ├── images/                  # Static brand assets
│   └── uploads/products/        # Uploaded product imagery (git-ignored)
├── database/
│   ├── schema.sql               # Single source of truth database DDL
│   └── seed.sql                 # Curated categories, products, variants, and sample customer
├── scripts/
│   ├── reset-db.js              # Drops, recreates, and seeds database (npm run db:reset)
│   └── create-admin.js          # Seeds administrator account (npm run seed:admin)
└── tests/
    └── integration/             # Supertest route test suites
```

---

## 4. Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **MySQL**: MySQL 8.x running locally or remotely

### 1. Installation

Clone the repository and install npm packages:

```bash
git clone <repository-url>
cd e-commerce
npm install
```

### 2. Environment Setup

Copy the environment template to create your `.env` file:

```bash
cp .env.example .env
```

Configure your MySQL credentials and desired session secret in `.env`:

```ini
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=glitchattire
DB_TEST_NAME=glitchattire_test

# Session Secret (32+ chars)
SESSION_SECRET=glitchattire_super_secret_session_key_12345

# Admin Credentials (used by npm run seed:admin)
ADMIN_EMAIL=admin@glitchattire.test
ADMIN_PASSWORD=change_me_now

# Storefront Settings
CURRENCY=PHP
```

### 3. Initialize & Seed Database

Run the database reset script to create the schema and populate clothing seed data:

```bash
npm run db:reset
```

### 4. Create Initial Administrator Account

Seed the administrator account from your `.env` credentials:

```bash
npm run seed:admin
```

### 5. Launch the Application

Start the development server with automatic file watching:

```bash
npm run dev
```

Visit the storefront at **http://localhost:3000**.  
Visit the admin console at **http://localhost:3000/admin/login**.

---

## 5. Demo Credentials

| Role              | Portal URL     | Email                        | Password        |
| ----------------- | -------------- | ---------------------------- | --------------- |
| **Customer**      | `/login`       | `customer@glitchattire.test` | `password123`   |
| **Administrator** | `/admin/login` | `admin@glitchattire.test`    | `change_me_now` |

---

## 6. Development Scripts

| Command              | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Starts server with `nodemon` for active local development |
| `npm run start`      | Starts production HTTP server with `node server.js`       |
| `npm run build`      | Validates application build integrity via ESLint          |
| `npm run db:reset`   | Drops, recreates, and seeds the MySQL database            |
| `npm run seed:admin` | Creates or updates the administrator account              |
| `npm test`           | Runs the automated Jest test suite                        |
| `npm run lint`       | Runs ESLint 9 checks across all source code               |
| `npm run format`     | Formats all JavaScript, EJS, and CSS with Prettier        |

---

## 7. Security Controls

- **CSRF Tokens:** All HTML forms include a hidden `<input type="hidden" name="_csrf" value="...">` verified by `csrf-csrf`.
- **SQL Injection Prevention:** 100% of queries in `models/` use prepared statements with `?` parameters.
- **Brute Force Defense:** Authentication routes `/login`, `/register`, and `/admin/login` are throttled via `express-rate-limit` (15 requests per 15 minutes per IP).
- **Password Security:** Salted password hashes using `bcrypt` cost factor 12.
- **HTTP Header Hardening:** Configured with `helmet` for Content Security Policy, frame options, and DNS prefetch controls.
- **Multipart Upload Sanitization:** Image uploads capped at 2 MB with strict MIME type and extension checking (JPEG/PNG/WebP) and random UUID filenames.
