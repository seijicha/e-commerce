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
