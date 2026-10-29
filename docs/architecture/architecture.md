# GlitchAttire E-Commerce Platform

## System Architecture & Technical Specifications

---

## 1. Executive Overview & Design Philosophy

**GlitchAttire** is a full-stack clothing e-commerce web application built on **Node.js (Express)**, **server-rendered HTML (EJS) with plain CSS**, and **MySQL 8**. Admins post and manage products; customers browse the catalog, and once signed in, add items to a cart and place orders.

### Core Business Rules

1. **Guests can browse, not buy.** Anyone can view the home page, shop listing and product details. Add to cart, cart, checkout and orders require a logged-in **customer** session. Guests who try are redirected to `/login` and returned to where they were after signing in.
2. **Two separate logins, two roles.** Customers use `/login` (self-registration allowed). Admins use `/admin/login` (no self-registration; created via seed script). Each login rejects the other role's credentials.
3. **Admins manage, customers shop.** Only admins can Create, Read, Update and Delete products and categories, and view/manage orders and customers. Admins cannot use the cart or checkout.
4. **The server is the source of truth.** Prices, totals and stock are always computed and validated on the server; nothing is trusted from the browser.

### Architectural Tenets

1. **Layered, Modular Backend:** `routes → controllers → services → models`. Each layer has one job and never reaches past its neighbor.
2. **Server-Rendered Views:** Express renders EJS templates into plain HTML. Mutations use standard HTML forms with Post/Redirect/Get and flash messages. JavaScript is progressive enhancement only.
3. **Role-Based Access via Middleware:** Two roles (`customer`, `admin`) enforced by `requireCustomer` and `requireAdmin` middleware on route groups.
4. **Transactional Integrity:** Checkout, stock changes and order cancellation run inside MySQL transactions with row locking to prevent overselling.
5. **Auditability:** Every admin mutation is written to an `audit_logs` table (actor, entity, before/after values, IP, user-agent).
6. **Plain CSS Design System:** One set of CSS custom properties (design tokens) and reusable component classes. No CSS frameworks.

---

## 2. Technology Stack & Topology

| Layer / Concern           | Technology                                  | Architectural Role                                                                      |
| ------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Runtime & Framework**   | Node.js 20 LTS / Express 4                  | HTTP server, routing, middleware pipeline                                               |
| **Database**              | MySQL 8.x via `mysql2/promise`              | Relational storage with foreign keys, indexes, transactions; parameterized queries only |
| **Templating**            | EJS + `express-ejs-layouts`                 | Server-rendered HTML with shared layouts and partials                                   |
| **Styling**               | Plain CSS (custom properties, no framework) | Design tokens, layout, components in `public/css/`                                      |
| **Client Scripts**        | Vanilla JavaScript (ES modules)             | Small enhancements: image preview, quantity steppers, confirm dialogs                   |
| **Sessions**              | `express-session` + `express-mysql-session` | Server-side sessions stored in MySQL; HTTP-only cookie                                  |
| **Password Hashing**      | `bcrypt`                                    | Salted password hashes (cost factor 12)                                                 |
| **Validation**            | `express-validator`                         | Input validation and sanitization per route                                             |
| **File Uploads**          | `multer`                                    | Product image upload (type/size checked, random filenames)                              |
| **Security**              | `helmet`, `csrf-csrf`, `express-rate-limit` | Secure headers, CSRF protection, login throttling                                       |
| **HTTP Verbs from Forms** | `method-override`                           | Lets HTML forms send `PUT`, `PATCH`, `DELETE` via `?_method=`                           |
| **Flash Messages**        | `connect-flash`                             | One-time success/error notices after redirects                                          |
| **Config**                | `dotenv`                                    | Environment-based configuration                                                         |
| **Testing**               | Jest + Supertest                            | Unit tests for services, integration tests for routes                                   |
| **Code Style**            | ESLint + Prettier                           | Automated linting and formatting                                                        |

---

## 3. Application Architecture & Layer Boundaries

```
[ Browser ]
     │  HTTP (HTML forms / GET pages)
     ▼
[ Express App: helmet → session → csrf → flash → locals ]
     │
     ▼
routes/            URL + HTTP verb → middleware chain → controller
     │             (requireCustomer / requireAdmin / validators / upload)
     ▼
controllers/       Thin HTTP orchestrators: read req, call a service, render or redirect
     │
     ▼
services/          Business rules, transactions, audit logging
     │
     ▼
models/            SQL only: one module per table/aggregate (mysql2 prepared statements)
     │
     ▼
[ MySQL 8 ]
```

### 3.1 Layer Responsibilities

1. **Routes (`routes/`):** Map URL + verb to a middleware chain and a controller method. Grouped by audience: public, auth, customer, admin. No logic.
2. **Controllers (`controllers/`):** Pure HTTP glue. Read `req`, call one service, then `res.render()` or `res.redirect()` with a flash message. Controllers contain no SQL, no validation rules, no price math and no transactions.
3. **Validators (`validators/`):** `express-validator` rule sets per feature (e.g. `product.validator.js`). A shared `handleValidation` middleware re-renders the form with errors and the previously entered values.
4. **Services (`services/`):** All business logic: stock checks, total calculation, order creation, status transitions, password hashing, ownership rules, and calls to `AuditLogger`. Services own transactions (`getConnection` → `beginTransaction` → `commit` / `rollback`).
5. **Models (`models/`):** Data access only. Every function accepts an optional connection so services can enclose several model calls in one transaction. Always use `?` placeholders; never concatenate user input into SQL.
6. **Middleware (`middleware/`):** Cross-cutting concerns: authentication guards, validation handler, upload handler, CSRF, error handler.

### 3.2 Domain Services

| Service            | Responsibility                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthService`      | Customer registration, customer login, admin login, role verification, password hashing/compare, session regeneration, login/logout audit events                          |
| `ProductService`   | Product CRUD with size variants and stock, image replacement/cleanup, slug generation, publish toggle, public catalog queries (search, category filter, sort, pagination) |
| `CategoryService`  | Category CRUD; blocks deletion while products still reference the category                                                                                                |
| `CartService`      | Add/update/remove cart items for the current customer; validates the variant exists, the product is published, and quantity does not exceed stock; computes cart summary  |
| `OrderService`     | Transactional checkout, order number generation, customer order history, admin order listing, status transitions, cancellation with restock                               |
| `CustomerService`  | Admin customer directory, customer detail with order history, activate/deactivate accounts                                                                                |
| `DashboardService` | Admin overview: product count, low-stock list, orders by status, recent orders, revenue totals                                                                            |
| `AuditLogger`      | `AuditLogger.log({ userId, action, entity, entityId, oldValues, newValues, req })`; strips sensitive keys (passwords, tokens) and records IP and user-agent               |

### 3.3 Access Control Rules

| Visitor      | Public pages | Cart / Checkout / My Orders                 | `/admin/*`                 |
| ------------ | ------------ | ------------------------------------------- | -------------------------- |
| **Guest**    | Allowed      | Redirect to `/login?next=<url>` with notice | Redirect to `/admin/login` |
| **Customer** | Allowed      | Allowed (own data only)                     | `403 Forbidden`            |
| **Admin**    | Allowed      | `403` (admins do not shop)                  | Allowed                    |

- `requireCustomer`: no session → flash "Please log in to continue" and redirect to `/login?next=`; admin session → 403.
- `requireAdmin`: no session → redirect to `/admin/login`; customer session → 403.
- **Ownership checks** live in services: a customer can only read or cancel orders where `orders.user_id` matches the session user, and only edit their own cart rows.
- **Guest UX on product pages:** the "Add to cart" button is replaced by "Log in to add to cart", linking to `/login?next=/shop/<slug>`.
- Deactivated accounts (`is_active = 0`) are rejected at login, and their sessions are invalidated on the next request.

### 3.4 Routing Map

**Public**

| Method | Path          | Purpose                                                   |
| ------ | ------------- | --------------------------------------------------------- |
| GET    | `/`           | Home: featured and newest products                        |
| GET    | `/shop`       | Catalog with `q`, `category`, `sort`, `page` query params |
| GET    | `/shop/:slug` | Product detail with size selector                         |

**Authentication**

| Method     | Path            | Purpose                       |
| ---------- | --------------- | ----------------------------- |
| GET / POST | `/register`     | Customer registration         |
| GET / POST | `/login`        | Customer login (rate-limited) |
| POST       | `/logout`       | Customer logout               |
| GET / POST | `/admin/login`  | Admin login (rate-limited)    |
| POST       | `/admin/logout` | Admin logout                  |

**Customer** (`requireCustomer`)

| Method    | Path                 | CRUD          | Purpose                                       |
| --------- | -------------------- | ------------- | --------------------------------------------- |
| GET       | `/cart`              | Read          | View cart with totals                         |
| POST      | `/cart/items`        | Create        | Add a variant (size) and quantity to the cart |
| PATCH     | `/cart/items/:id`    | Update        | Change quantity                               |
| DELETE    | `/cart/items/:id`    | Delete        | Remove an item                                |
| GET       | `/checkout`          | Read          | Review cart and enter shipping details        |
| POST      | `/checkout`          | Create        | Place the order (transaction)                 |
| GET       | `/orders`            | Read          | My order history                              |
| GET       | `/orders/:id`        | Read          | My order detail                               |
| POST      | `/orders/:id/cancel` | Update        | Cancel a pending order (restocks)             |
| GET / PUT | `/account`           | Read / Update | View and edit profile                         |

**Admin** (`requireAdmin`)

| Method     | Path                                       | CRUD          | Purpose                                       |
| ---------- | ------------------------------------------ | ------------- | --------------------------------------------- |
| GET        | `/admin`                                   | Read          | Dashboard                                     |
| GET        | `/admin/products`                          | Read          | Product list with search, filters, pagination |
| GET        | `/admin/products/new`                      | n/a           | New product form                              |
| POST       | `/admin/products`                          | **Create**    | Create product + variants + image             |
| GET        | `/admin/products/:id`                      | Read          | Product detail                                |
| GET        | `/admin/products/:id/edit`                 | n/a           | Edit form                                     |
| PUT        | `/admin/products/:id`                      | **Update**    | Update product, variants, image               |
| PATCH      | `/admin/products/:id/publish`              | Update        | Publish / unpublish                           |
| DELETE     | `/admin/products/:id`                      | **Delete**    | Delete product and its image                  |
| GET / POST | `/admin/categories`                        | Read / Create | List and add categories                       |
| PUT        | `/admin/categories/:id`                    | Update        | Rename category                               |
| DELETE     | `/admin/categories/:id`                    | Delete        | Delete (blocked if in use)                    |
| GET        | `/admin/orders`, `/admin/orders/:id`       | Read          | Order list and detail                         |
| PATCH      | `/admin/orders/:id/status`                 | Update        | Move order through its lifecycle              |
| GET        | `/admin/customers`, `/admin/customers/:id` | Read          | Customer directory and detail                 |
| PATCH      | `/admin/customers/:id/active`              | Update        | Activate / deactivate customer                |

### 3.5 Request Pipeline (`app.js`)

```
helmet → static (/public) → express.urlencoded → method-override(?_method)
→ session (MySQL store) → flash → csrf-csrf → res.locals (user, csrfToken, flash, currency)
→ routes → 404 handler → centralized error handler
```

- Multipart upload routes run **`multer` before CSRF validation** so the form token field is parsed.
- The error handler renders `views/pages/errors/{403,404,500}.ejs` and never leaks stack traces in production.

---

## 4. Frontend Architecture (HTML + CSS)

### 4.1 Directory Layout

```
views/
├── layouts/
│   ├── main.ejs                # Storefront shell (header, nav, cart badge, footer)
│   ├── admin.ejs               # Admin shell (sidebar, topbar)
│   └── auth.ejs                # Minimal shell for login/register pages
├── partials/
│   ├── header.ejs
│   ├── footer.ejs
│   ├── flash.ejs               # Success / error notices
│   ├── pagination.ejs
│   ├── product-card.ejs
│   ├── form-field.ejs          # Label + input + error message
│   └── confirm-delete.ejs      # Delete confirmation dialog
├── pages/                      # Storefront pages (route views are named index.ejs)
│   ├── home/index.ejs
│   ├── shop/index.ejs
│   ├── shop/show.ejs
│   ├── auth/login.ejs
│   ├── auth/register.ejs
│   ├── cart/index.ejs
│   ├── checkout/index.ejs
│   ├── orders/index.ejs
│   ├── orders/show.ejs
│   ├── account/index.ejs
│   └── errors/{403,404,500}.ejs
└── admin/
    ├── auth/login.ejs
    ├── dashboard/index.ejs
    ├── products/{index,show,new,edit,_form}.ejs
    ├── categories/index.ejs
    ├── orders/{index,show}.ejs
    └── customers/{index,show}.ejs

public/
├── css/
│   ├── tokens.css              # Design tokens (colors, type, spacing, radii)
│   ├── base.css                # Reset, typography, element defaults
│   ├── layout.css              # Containers, grid, header, sidebar, footer
│   ├── components.css          # Buttons, forms, cards, tables, badges, alerts, dialogs
│   └── pages.css               # Page-specific rules (product gallery, checkout summary)
├── js/
│   ├── main.js                 # Entry point; initializes enhancements via data-* hooks
│   ├── quantity.js             # Quantity stepper
│   ├── image-preview.js        # Product image preview in admin form
│   ├── variants.js             # Add/remove size rows in admin product form
│   └── confirm.js              # <dialog>-based delete confirmation
├── images/                     # Logo and static brand assets
└── uploads/products/           # Admin-uploaded product images (git-ignored)
```

### 4.2 Design System

- **Tokens first.** All colors, fonts, spacing and radii are CSS custom properties in `tokens.css`; components never hardcode values.

```css
:root {
  --color-bg: #0b0b0f;
  --color-surface: #15151c;
  --color-text: #f4f4f8;
  --color-muted: #9a9aab;
  --color-accent: #ff2e63; /* glitch magenta */
  --color-accent-alt: #08f7fe; /* glitch cyan */
  --color-success: #2ecc71;
  --color-danger: #ff4d4f;
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;
  --radius: 6px;
}
```

- **Naming:** BEM-style component classes (`.btn`, `.btn--primary`, `.card`, `.card__title`, `.badge--success`).
- **Responsive:** Mobile-first with CSS Grid/Flexbox; breakpoints at 640px, 960px and 1200px. Admin tables scroll inside an `overflow-x: auto` wrapper.
- **Accessibility:** Semantic HTML, labelled form controls with associated error text, visible focus rings, `alt` text on product images, a skip link, and native `<dialog>` for confirmations.

### 4.3 Naming Conventions (MANDATORY)

1. **Route views** are named `index.ejs` inside their feature folder (`pages/cart/index.ejs`). Detail views are `show.ejs`; creation and edit views are `new.ejs` and `edit.ejs`.
2. **Shared forms** use an underscore partial (`admin/products/_form.ejs`) included by both `new.ejs` and `edit.ejs`.
3. **Partials** are lowercase, hyphenated (`product-card.ejs`) and live in `views/partials/`.
4. **Reusable UI** (buttons, form fields, cards, badges) comes from the shared partials and component classes. Do not restyle ad hoc.
5. **JavaScript hooks use `data-*` attributes** (`data-confirm`, `data-quantity`, `data-image-input`), never CSS classes, so styling changes cannot break behavior.
6. **Escaping:** Always output user content with `<%= %>` (escaped). `<%- %>` is reserved for trusted partial includes.

### 4.4 Key Screens

| Screen                 | Behavior                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shop**               | Search box, category filter, sort (newest / price), paginated product grid                                                                                    |
| **Product detail**     | Image, description, price, size selector showing per-size stock. Customers see "Add to cart"; guests see "Log in to add to cart". Sold-out sizes are disabled |
| **Cart**               | Line items with quantity steppers, remove buttons, subtotal; "Proceed to checkout"                                                                            |
| **Checkout**           | Shipping form, order summary, payment method (Cash on Delivery), "Place order"                                                                                |
| **Admin products**     | Table with thumbnail, name, category, price, total stock, status; row actions View / Edit / Publish toggle / Delete (confirm dialog)                          |
| **Admin product form** | Name, category, price, description, image upload with preview, dynamic size + stock rows, published checkbox                                                  |
| **Admin dashboard**    | Stat cards (products, low stock, pending orders, revenue), recent orders, low-stock list                                                                      |

---

## 5. Core Data Models & Database Architecture

### 5.1 Entity Relationships

```
[ users ] ──1:N── [ orders ] ──1:N── [ order_items ]   (snapshot columns; product/variant FK SET NULL)
    │
    ├──1:N── [ cart_items ] ──N:1── [ product_variants ] ──N:1── [ products ] ──N:1── [ categories ]
    │
    └──1:N── [ audit_logs ]
```

### 5.2 Schema (`database/schema.sql`)

```sql
CREATE DATABASE IF NOT EXISTS glitchattire
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glitchattire;

CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  phone         VARCHAR(30)   NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(80)  NOT NULL UNIQUE,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(150) NOT NULL,
  slug         VARCHAR(180) NOT NULL UNIQUE,
  description  TEXT NULL,
  price        DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_path   VARCHAR(255) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_by   INT UNSIGNED NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by)  REFERENCES users(id)      ON DELETE SET NULL,
  INDEX idx_products_listing (is_published, category_id, created_at),
  FULLTEXT INDEX ft_products_search (name, description)
) ENGINE=InnoDB;

CREATE TABLE product_variants (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  size       VARCHAR(10)  NOT NULL,                  -- XS, S, M, L, XL, XXL, ONE SIZE
  stock      INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_product_size (product_id, size),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  variant_id INT UNSIGNED NOT NULL,
  quantity   SMALLINT UNSIGNED NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_user_variant (user_id, variant_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)            ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE orders (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number         VARCHAR(20) NOT NULL UNIQUE,          -- e.g. GA-20261029-0001
  user_id              INT UNSIGNED NULL,
  status               ENUM('pending','paid','shipped','delivered','cancelled')
                       NOT NULL DEFAULT 'pending',
  payment_method       VARCHAR(20) NOT NULL DEFAULT 'cod',   -- 'cod', 'gcash', 'bank_transfer'
  subtotal             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_fee         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total                DECIMAL(10,2) NOT NULL,
  shipping_name        VARCHAR(100) NOT NULL,
  shipping_phone       VARCHAR(30)  NOT NULL,
  shipping_address     VARCHAR(255) NOT NULL,
  shipping_city        VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20)  NOT NULL,
  shipping_country     VARCHAR(100) NOT NULL DEFAULT 'Philippines',
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orders_user (user_id, created_at),
  INDEX idx_orders_status (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     INT UNSIGNED NOT NULL,
  product_id   INT UNSIGNED NULL,
  variant_id   INT UNSIGNED NULL,
  product_name VARCHAR(150) NOT NULL,                 -- snapshot
  size         VARCHAR(10)  NOT NULL,                 -- snapshot
  unit_price   DECIMAL(10,2) NOT NULL,                -- snapshot
  quantity     SMALLINT UNSIGNED NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)           ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)         ON DELETE SET NULL,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NULL,
  action     VARCHAR(50)  NOT NULL,                   -- created, updated, deleted, login, logout
  entity     VARCHAR(50)  NOT NULL,                   -- product, category, order, user
  entity_id  INT UNSIGNED NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45)  NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_entity (entity, entity_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;
```

> The `sessions` table is created automatically by `express-mysql-session`.

### 5.3 Table Notes

- **`users`**: One table, two roles. Customers self-register; admins are created only with `npm run seed:admin`. The `is_active` flag blocks login without deleting history.
- **`products` + `product_variants`**: Sizes and per-size stock live in variants, which is how clothing is actually sold. Prices are `DECIMAL(10,2)`; `mysql2` is configured with `decimalNumbers: true`.
- **`cart_items`**: One row per customer per variant (unique key), so "add to cart" on an existing size increments the quantity (`INSERT … ON DUPLICATE KEY UPDATE`).
- **`order_items`**: Stores a **snapshot** of name, size and unit price. Orders stay accurate and readable even after a product is edited or deleted (`product_id` becomes `NULL`).
- **`categories`**: `ON DELETE RESTRICT` prevents orphaning products; `CategoryService` converts the DB error into a friendly message.

### 5.4 Order Lifecycle

```
pending ──► paid ──► shipped ──► delivered
   │          │
   └──────────┴──► cancelled   (restocks every item)
```

Transitions are validated in `OrderService.updateStatus()`. Backward moves, and any change from `delivered` or `cancelled`, are rejected. Customers may cancel only while `pending`.

---

## 6. Critical Workflows

### 6.1 Customer Login & Return-To Flow

1. A guest clicks "Add to cart" or visits `/cart`. `requireCustomer` stores the target in `req.session.returnTo`, flashes "Please log in to continue" and redirects to `/login`.
2. `POST /login` validates input, loads the user by email, rejects non-customers and inactive accounts, and runs `bcrypt.compare`.
3. On success, `req.session.regenerate()` creates a fresh session ID (prevents session fixation), stores `{ id, name, role }`, and redirects to `returnTo` or `/` (the home page).
4. Failed attempts show one generic message ("Invalid email or password") and count toward the rate limit (e.g. 10 attempts per 15 minutes per IP).

### 6.2 Add to Cart

1. `POST /cart/items` with `variant_id` and `quantity` (CSRF-protected, `requireCustomer`).
2. `CartService.addItem()` loads the variant joined to its product, confirms the product is published, then computes `existing + requested` and rejects it if it exceeds `stock`.
3. Upsert the cart row; flash "Added to cart" and redirect back to the product page.

### 6.3 Checkout (transactional)

```
BEGIN
  1. SELECT cart rows JOIN variants JOIN products WHERE user_id = ? FOR UPDATE
  2. Reject if the cart is empty, a product is unpublished, or quantity > stock
  3. Compute total on the server from current DB prices
  4. INSERT orders (status = 'pending', shipping snapshot)
  5. INSERT order_items (name, size, unit_price, quantity snapshots)
  6. UPDATE product_variants SET stock = stock - quantity
  7. DELETE FROM cart_items WHERE user_id = ?
  8. AuditLogger.log(...)
COMMIT   (any error → ROLLBACK, cart untouched, friendly message shown)
```

The `FOR UPDATE` row locks guarantee two customers can never buy the last item at the same time.

### 6.4 Admin Product CRUD

| Operation  | Flow                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Create** | `POST /admin/products` → multer saves image → validators → `ProductService.create()` inserts product + variant rows in one transaction → audit log → redirect to list with flash           |
| **Read**   | `GET /admin/products` (search, category, status, pagination, default 10 per page) and `GET /admin/products/:id`                                                                            |
| **Update** | `PUT /admin/products/:id` → validate → update product, diff variants (insert new sizes, update stock, delete removed sizes) → delete the old image if replaced → audit with old/new values |
| **Delete** | `DELETE /admin/products/:id` → confirm dialog → delete row (variants and cart items cascade, order snapshots preserved) → remove image file → audit log                                    |

> **Tip for admins:** _Unpublish_ hides a product from the storefront without deleting it, and is the safer choice for items with order history.

---

## 7. Security Architecture

| Concern                  | Control                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SQL injection**        | Parameterized queries (`?` placeholders) in every model; no string-built SQL                                                                             |
| **XSS**                  | EJS escapes by default (`<%= %>`); validators trim/escape text input; strict CSP via `helmet`                                                            |
| **CSRF**                 | `csrf-csrf` token on every state-changing form (hidden `_csrf` field)                                                                                    |
| **Passwords**            | `bcrypt` cost 12; minimum length 8; never logged or returned to views                                                                                    |
| **Sessions**             | HTTP-only, `SameSite=Lax`, `Secure` in production; server-side store; regenerated on login; destroyed on logout; shorter idle timeout for admin sessions |
| **Brute force**          | `express-rate-limit` on `/login`, `/admin/login`, `/register`                                                                                            |
| **Privilege escalation** | Role comes only from the server session; `role` is never accepted from a form; role guards on route groups; ownership checks in services                 |
| **File uploads**         | JPEG/PNG/WebP only, max 2 MB, random generated filenames, stored under `public/uploads/products/`, MIME type and extension both checked                  |
| **Price tampering**      | Cart and checkout recompute all prices from the database; the client sends only `variant_id` and `quantity`                                              |
| **Information leakage**  | Generic login errors; production error pages hide stack traces; secrets in `.env` (git-ignored)                                                          |
| **Admin account safety** | No public admin signup; at least one active admin must remain                                                                                            |

---

## 8. Project Structure

```
glitchattire/
├── app.js                       # Express app assembly (no listen)
├── server.js                    # Starts HTTP server
├── package.json
├── .env.example
├── config/
│   ├── env.js                   # Reads and validates environment variables
│   ├── db.js                    # mysql2 connection pool
│   └── session.js               # Session + MySQL store config
├── routes/
│   ├── index.js                 # Mounts all route groups
│   ├── public.routes.js
│   ├── auth.routes.js
│   ├── customer.routes.js       # cart, checkout, orders, account
│   └── admin/
│       ├── index.js             # Applies requireAdmin to the group
│       ├── product.routes.js
│       ├── category.routes.js
│       ├── order.routes.js
│       └── customer.routes.js
├── controllers/                 # Mirrors routes/
│   ├── shop.controller.js
│   ├── auth.controller.js
│   ├── cart.controller.js
│   ├── checkout.controller.js
│   ├── order.controller.js
│   ├── account.controller.js
│   └── admin/{dashboard,product,category,order,customer}.controller.js
├── services/
│   ├── auth.service.js
│   ├── product.service.js
│   ├── category.service.js
│   ├── cart.service.js
│   ├── order.service.js
│   ├── customer.service.js
│   ├── dashboard.service.js
│   └── audit-logger.js
├── models/
│   ├── user.model.js
│   ├── product.model.js
│   ├── variant.model.js
│   ├── category.model.js
│   ├── cart.model.js
│   ├── order.model.js
│   └── audit-log.model.js
├── validators/
│   ├── auth.validator.js
│   ├── product.validator.js
│   ├── category.validator.js
│   ├── cart.validator.js
│   └── checkout.validator.js
├── middleware/
│   ├── auth.js                  # requireCustomer, requireAdmin, attachUser
│   ├── validate.js              # handleValidation (re-render with errors)
│   ├── upload.js                # multer config
│   ├── csrf.js
│   ├── rate-limit.js
│   └── error-handler.js
├── utils/
│   ├── slugify.js
│   ├── money.js                 # Currency formatting (default PHP ₱, configurable)
│   ├── pagination.js
│   └── order-number.js
├── views/                       # See section 4.1
├── public/                      # See section 4.1
├── database/
│   ├── schema.sql
│   └── seed.sql                 # Categories + sample products with sizes
├── scripts/
│   └── create-admin.js          # npm run seed:admin
└── tests/
    ├── unit/services/           # Mirrors services/
    └── integration/             # Supertest route tests
```

---

## 9. Development Conventions & Quality Standards

1. **Configuration (`.env.example`):**
   ```
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=glitch_user
   DB_PASSWORD=change_me
   DB_NAME=glitchattire
   SESSION_SECRET=replace_with_long_random_string
   ADMIN_EMAIL=admin@glitchattire.test
   ADMIN_PASSWORD=change_me_now
   CURRENCY=PHP
   ```
2. **Database Maintenance:**
   - `database/schema.sql` is the single source of truth. In active development, edit it directly rather than stacking alter scripts.
   - `npm run db:reset` drops, recreates, and reseeds the database from `schema.sql` and `seed.sql`.
   - `npm run seed:admin` creates or updates the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. **npm Scripts:** `dev` (nodemon), `start`, `db:reset`, `seed:admin`, `test`, `lint`, `format`.
4. **Layer Discipline (enforced in review):**
   - No SQL outside `models/`.
   - No business rules or transactions outside `services/`.
   - No validation arrays or price math inside controllers.
   - Every admin mutation calls `AuditLogger`.
5. **Automated Testing (Jest + Supertest) with 1:1 mirroring:**
   - `tests/unit/services/<name>.service.test.js` for business rules (stock limits, status transitions, cart upserts).
   - `tests/integration/<feature>.test.js` for routes. Mandatory cases:
     - A guest hitting `POST /cart/items`, `/cart` or `/checkout` is redirected to `/login`.
     - A customer hitting any `/admin/*` route receives 403.
     - An admin hitting `/cart` or `/checkout` receives 403.
     - A customer cannot view or cancel another customer's order.
     - Checkout rejects quantity above stock and rolls back completely.
     - Product create, read, update and delete succeed for admin and write audit rows.
   - Tests run against a separate `glitchattire_test` database.
6. **Code Style:** ESLint and Prettier must pass before a task is considered complete (`npm run lint`).

---

## 10. Suggested Build Order

1. Project scaffold, `config/`, DB pool, `schema.sql`, session store, base layouts and CSS tokens.
2. Authentication: customer register/login/logout, admin login, guards, `seed:admin`.
3. Admin categories CRUD, then admin products CRUD with variants and image upload.
4. Public catalog: home, shop (search/filter/pagination), product detail with guest/customer button states.
5. Cart (customer-only), then transactional checkout and order history.
6. Admin orders (status updates), customers directory, dashboard.
7. Audit logging polish, error pages, security hardening, tests, seed data.

---

## 11. Explicit Scope Boundaries

- **Payments:** Checkout supports Cash on Delivery only. A payment gateway (e.g. PayMongo or Stripe) can later plug into `OrderService`, needing little beyond a payment reference column.
- **Not included:** Wishlists, product reviews, coupons, email/SMS notifications, multi-image galleries, and password reset by email.
- **Currency:** Single currency, configurable by environment variable.
