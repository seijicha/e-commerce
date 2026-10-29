# Database & Seeding

- In active local development, follow this rule: edit `database/schema.sql` directly and run `npm run db:reset` instead of creating alter/drop scripts.
- When modifying an existing column, keep every attribute that was previously defined on it (type, nullability, default, key, constraint) so nothing is silently dropped.
- Keep foreign key behavior consistent with the architecture document (for example `ON DELETE RESTRICT` for products → categories, snapshot columns plus `ON DELETE SET NULL` for order items).
- Every entity must have realistic seed data in `database/seed.sql`.
