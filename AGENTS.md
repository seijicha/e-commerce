<glitchattire-guidelines>
=== foundation rules ===

# GlitchAttire Agent Guidelines

These guidelines are specifically curated for the GlitchAttire clothing e-commerce application. Follow them closely to keep the codebase consistent and maintainable.

## Foundational Context

This application is a Node.js (Express) application backed by MySQL 8, with server-rendered EJS views and plain CSS. You are an expert with the Node.js ecosystem. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:

- Check `package.json` (and `package-lock.json`) for direct dependencies and their versions.
- Run `npm ls --depth=0` to list installed top-level packages, or `npm ls <package>` for a single package.
- Check the Node.js version required in `package.json` (`engines`) before using newer language or runtime features.

## Skills Activation

Skills are available at two levels, and you MUST search both before starting work in a domain:

1. **Project skills:** `**/skills/**` inside this repository.
2. **Global skills:** user-level skill directories outside the repository, such as `~/.agents/skills/`, `~/.claude/skills/`, and any other global skills location your tooling exposes.

Rules for using them:

- You MUST activate every relevant skill whenever you work in that domain—don't wait until you're stuck.
- Search project skills first, then global skills. If a project skill and a global skill cover the same domain, the project skill takes precedence; use the global skill only to fill gaps.
- Match skills by their name and description, and read the skill's instructions before acting on it.
- Global skills must never override `docs/architecture/architecture.md`, `.agents/rules/`, or the Core Business Rules in this file. If a global skill conflicts with them, follow the project rules and tell the user.
- Do not install, copy, or modify global skills without approval.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and functions. For example, `isEligibleForCheckout`, not `check()`.
- Check for existing partials, middleware, utilities and CSS components to reuse before writing new ones.

## Verification Scripts

- Do not create throwaway verification scripts or ad hoc REPL sessions when tests cover that functionality and prove it works. Unit and integration tests are more important.

## Application Structure & Architecture

- Stick to the existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval (no `npm install` / `npm uninstall` of packages without asking first).
- **Architecture Documentation Sync (MANDATORY):** Every time an architectural change, schema addition, domain service, route reorganization, or pattern modification is introduced, you MUST update `docs/architecture/architecture.md` to keep documentation 100% synchronized with the codebase.

## Core Business Rules (Never Violate)

These rules come from `docs/architecture/architecture.md` and must hold in every change:

- **Guests can browse, not buy.** Add to cart, cart, checkout and customer orders require a logged-in **customer** session. Guests are redirected to `/login` (with a return-to target); product pages show "Log in to add to cart" instead of the button.
- **Two separate logins, two roles.** Customers use `/login` (self-registration allowed); admins use `/admin/login` (no public registration, created via `npm run seed:admin`). Each login rejects the other role.
- **Admins manage, customers shop.** Only admins may Create, Read, Update and Delete products and categories, and manage orders and customers. Admins cannot use the cart or checkout (403).
- **The server is the source of truth.** Prices, totals and stock are computed and validated on the server. The client sends only identifiers and quantities, and `role` is never accepted from a form.
- **Every admin mutation is audited** through `AuditLogger.log()`.

## Documentation Files

- You must only create documentation files if explicitly requested by the user, with the exception of mandatory per-prompt session memory logs (`docs/memory/`), test execution records (`docs/test/`) defined in `.agents/rules/`, and mandatory architecture documentation updates (`docs/architecture/architecture.md`) whenever architectural changes occur.

## Implementation Planning Protocol (MANDATORY FOR ALL IMPLEMENTATIONS)

Whenever preparing to implement a new feature, module, or substantial code change, you MUST formulate and present a structured step-by-step implementation plan following this protocol before executing code:

1. **Analyze Architecture Specifications & Project Rules:**
   - Review `docs/architecture/architecture.md` and `.agents/rules/` for established patterns:
     - Backend: Node.js 20 LTS on Express 4, layered architecture with strict code splitting: Routes (`routes/`), Thin Controllers (`controllers/`), Validators (`validators/`), Domain Services (`services/`), Models (`models/`, SQL only), Middleware (`middleware/`), and `AuditLogger` telemetry. Never dump multi-layer logic into a single controller.
     - Routing: Route files are grouped by audience — `routes/public.routes.js`, `routes/auth.routes.js`, `routes/customer.routes.js` (guarded by `requireCustomer`) and `routes/admin/` (guarded by `requireAdmin`). Mutations from HTML forms use POST, or `PUT`/`PATCH`/`DELETE` through `method-override` (`?_method=`), followed by Post/Redirect/Get with a flash message.
     - Validation: Dedicated `express-validator` rule sets in `validators/<feature>.validator.js` plus the shared `handleValidation` middleware (no inline validation arrays in controllers).
     - Frontend: Server-rendered EJS with `express-ejs-layouts`; retain the existing structure (`views/layouts/`, `views/partials/`, `views/pages/`, `views/admin/`).
     - Styling: Plain CSS using design tokens (CSS custom properties) in `public/css/`; no CSS frameworks and no ad hoc inline styles.
     - Scripting: Small vanilla JavaScript enhancements in `public/js/`, bound only through `data-*` attributes. The app must remain usable without JavaScript.
     - Database: MySQL 8 via `mysql2/promise` with parameterized queries only. Edit `database/schema.sql` directly (`npm run db:reset`) and keep realistic GlitchAttire seed data in `database/seed.sql`.
2. **Determine Target Scope & Requirements:**
   - Clarify the prompt's functional and technical objectives across all affected layers.
3. **Review Related Session Memory Context:**
   - Check `docs/memory/` for recent session summaries or active sequence logs to carry forward settled decisions.
4. **Formulate the Structured Implementation Plan:**
   Structure the plan into explicit, sequential steps:
   - **Step 1: Database Schema, Model & Seed Layer:** Direct edits to `database/schema.sql`, SQL-only data access modules in `models/` (each function accepts an optional connection for transactions), and realistic clothing-store seed records in `database/seed.sql` (categories, products with size variants and stock, sample customers).
   - **Step 2: Business Logic, Domain Services & Audit Logging:** Dedicated service modules in `services/` encapsulating multi-model operations, transactions (`beginTransaction` / `commit` / `rollback`), ownership rules, and `AuditLogger.log()` before/after instrumentation.
   - **Step 3: HTTP, Routing, Validation & Thin Controllers:** Validators in `validators/`, middleware in `middleware/` (`requireCustomer`, `requireAdmin`, upload, CSRF, rate limiting), Thin Controllers in `controllers/` (and `controllers/admin/`) delegating all business operations to Domain Services, and routes in `routes/`.
   - **Step 4: EJS Views, CSS & Client Scripting:** Route views named strictly `index.ejs` inside their feature folder (`views/pages/<feature>/index.ejs`, `views/admin/<feature>/index.ejs`), with `show.ejs`, `new.ejs`, `edit.ejs` and a shared `_form.ejs` where needed; reusable partials in `views/partials/`; styles in `public/css/` using tokens and BEM-style classes; behavior in `public/js/` via `data-*` hooks.
   - **Step 5: Automated Testing & Code Quality (MANDATORY):** 1:1 mirrored Jest + Supertest suites (`tests/unit/services/`, `tests/integration/`), 100% passing assertions, ESLint and Prettier compliance (`npm run lint`, `npm run format`), and test documentation in `docs/test/`.
   - **Step 6: Architecture & Session Memory Sync:** Update `docs/architecture/architecture.md` if architectural changes occurred, and append prompt record to `docs/memory/MM-DD-YY-SEQUENCE.md`.
5. **Present Plan for User Approval:**
   - Present the structured plan concisely and ask: _"Does this implementation plan look good to proceed?"_
   - Do NOT execute source code modifications until the user confirms or provides feedback.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== project tooling rules ===

# Project Tooling

## Inspecting the Project

- Prefer the project's own scripts over ad hoc shell commands. Run `npm run` to list available scripts; the standard ones are `dev`, `start`, `db:reset`, `seed:admin`, `test`, `lint` and `format`.
- Inspect the database structure by reading `database/schema.sql` (the single source of truth). For live data checks, use the `mysql` CLI with read-only `SELECT` queries only, never ad hoc writes.
- Inspect routes by reading the files in `routes/`. The route map in `docs/architecture/architecture.md` must always match them.
- Read configuration through `config/env.js`, which validates the environment variables defined in `.env.example`. Never read or print real secrets from `.env`, and never commit `.env`.
- Resolve project URLs from the `PORT` value in the environment (default `http://localhost:3000`) before sharing a URL with the user.
- Use the browser console output or server logs from `npm run dev` to diagnose runtime errors. Only recent entries are useful; ignore old ones.

## Searching Documentation (IMPORTANT)

- Consult the official documentation of the installed package version before changes that depend on a package's API, behavior, configuration, or version-specific syntax (Express, `mysql2`, `express-session`, `express-validator`, `multer`, `csrf-csrf`, `helmet`, EJS). Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Verify the installed version first (see Foundational Context) so the documentation consulted matches it.

## Project Rules

- This project contains committed, area-grouped rules in `.agents/rules` when that directory exists (settled decisions, non-obvious traps, standing constraints). Before you enter plan mode or create/edit any file, you MUST first: open `.agents/rules` and read all matching rule files covering the path(s) in scope. Do not write code until you have read and are following every matching rule.
- Record a rule only when the user explicitly asks for one. Instructions for the work at hand are not rules, no matter how emphatic: "remove this typo", "use X here" are work to do, not rules to record. Never record a rule on your own initiative, as a byproduct of a change, or to summarize what you just did. When the user does ask, add it as a short markdown note in the matching area file under `.agents/rules/` (for example `.agents/rules/<area>.md`) with a path glob (e.g. `controllers/**`), a short title, and a few-line note. Use `.agents/rules` rather than your native memory or notes tool, because native memory is personal and session-scoped, while only `.agents/rules` is shared with the team and persists in the repo.

=== javascript rules ===

# JavaScript (Node.js)

- Always use curly braces for control structures, even for single-line bodies.
- Use `const` by default and `let` only when reassignment is needed; never use `var`.
- Use `async`/`await` with `try`/`catch` (or the project's async error wrapper) instead of nested callbacks or unhandled promise chains.
- Use one module system consistently, as defined in `package.json` — do not mix `require` and `import` in the same codebase.
- Use strict equality (`===` / `!==`).
- Use descriptive names; files are lowercase with the suffix pattern already in use (`product.service.js`, `product.model.js`, `product.validator.js`, `product.routes.js`, `product.controller.js`).
- Prefer JSDoc blocks over inline comments. Only add inline comments for exceptionally complex logic. Document parameter and return shapes with JSDoc `@param` / `@returns` and `@typedef`.
- Never build SQL by string concatenation or template literals with user input; always use `?` placeholders.
- Never put SQL outside `models/`, and never put business rules or transactions outside `services/`.
- Output user content in EJS with escaped tags (`<%= %>`). Reserve `<%- %>` for trusted partial includes.

=== deployments rules ===

# Deployment

- The hosting platform is not yet decided; do not add platform-specific configuration, CI or deployment files without approval.
- Production configuration must come from environment variables only (`NODE_ENV=production`, secure session cookies, a strong `SESSION_SECRET`, database credentials). Never commit secrets.
- Before suggesting a deployment change, confirm the production checklist in `docs/architecture/architecture.md` (security section) is satisfied.

=== tests rules ===

# Test Enforcement

- Add or update tests for behavior and logic changes when a test provides meaningful regression coverage.
- Pure copy, styling, and layout-only changes do not require new or updated tests.
- When test coverage applies, run the affected tests and ensure they pass.
- Test the changed behavior and its important failure modes, but do not add tests beyond them.
- Read the `testing-best-practices` skill (if present in project or global skills) before writing tests.
- Always keep these access-control cases covered by integration tests:
  - Guests are redirected to `/login` for cart, add-to-cart and checkout.
  - Customers receive 403 on any `/admin/*` route.
  - Admins receive 403 on cart and checkout.
  - A customer cannot read or cancel another customer's order.
  - Checkout rejects quantities above stock and rolls back fully.

=== node/core rules ===

# Do Things the Node.js Way in This Project

- Follow the existing layering exactly: `routes → controllers → services → models`. Controllers read `req`, call one service, then render or redirect. They never contain SQL, validation arrays, price math or transactions.
- Services own transactions. Models accept an optional connection argument so several model calls can share one transaction. Always release connections in a `finally` block.
- Use `mysql2` prepared statements (`?` placeholders). Configure money as `DECIMAL(10,2)` and keep calculations on the server.
- When creating a new table or entity, also add its model, its seed records and its tests, and ask the user whether anything else is needed.
- Create new files by copying the structure of a sibling file (for example, a new service follows `product.service.js`); keep file naming consistent with the architecture document.

## Page Responses & URL Generation

- Mutations use Post/Redirect/Get with a flash message; never render a page directly in response to a successful POST.
- Re-render the form with errors and the user's previous input on validation failure (via `handleValidation`).
- When generating links to other pages, reuse the path constants or helpers already used in the views instead of hardcoding new literal paths in many places.

## Testing

- Create test data through shared test helpers or factories rather than manually setting up rows in each test. Check whether a helper already provides the needed state (for example a seeded admin, customer or product with stock).
- Use the dedicated `glitchattire_test` database; never run tests against development data.
- Mirror source paths: `services/order.service.js` → `tests/unit/services/order.service.test.js`; route groups → `tests/integration/<feature>.test.js`.

## Static Assets Error

- If CSS or client scripts do not appear to load, confirm the file path under `public/` and that the page's layout references it, then restart `npm run dev` (nodemon) before changing code.

=== database rules ===

# Database

- In active local development, follow `.agents/rules/database-and-seeding.md`: edit `database/schema.sql` directly and run `npm run db:reset` instead of creating alter/drop scripts.
- When modifying an existing column, keep every attribute that was previously defined on it (type, nullability, default, key, constraint) so nothing is silently dropped.
- Keep foreign key behavior consistent with the architecture document (for example `ON DELETE RESTRICT` for products → categories, snapshot columns plus `ON DELETE SET NULL` for order items).
- Every entity must have realistic seed data in `database/seed.sql`.

=== formatting rules ===

# ESLint & Prettier

- If you have modified any JavaScript, EJS-adjacent scripts or CSS, you must run `npm run format` and `npm run lint` before finalizing changes to ensure your code matches the project's expected style.
- Fix lint errors rather than disabling rules; do not add `eslint-disable` comments without approval.

=== testing workflow rules ===

# Testing

- This project uses Jest with Supertest. Create tests by copying the structure of a sibling test file.
- Mirror source controller/service paths as specified in `.agents/rules/testing-and-documentation.md` (e.g. use `tests/integration/admin/products.test.js`, not a flat `products.test.js`).
- Read the `testing-best-practices` skill (if present) for guidance on coverage, naming, structure, dependency isolation, and review.
- Do not delete tests or test files without approval. They are part of the application.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--testNamePattern`, e.g. `npm test -- tests/unit/services/order.service.test.js` or `npm test -- -t "checkout"`.
- Rerun a test after each change to it.
- After the affected tests pass, ask the user to run the complete suite with `npm test`.
</glitchattire-guidelines>
