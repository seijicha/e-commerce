# Testing & Documentation

- This project uses Jest with Supertest. Create tests by copying the structure of a sibling test file.
- Mirror source controller/service paths as specified (e.g. use `tests/integration/admin/products.test.js`, not a flat `products.test.js`).
- Read the `testing-best-practices` skill (if present) for guidance on coverage, naming, structure, dependency isolation, and review.
- Do not delete tests or test files without approval. They are part of the application.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--testNamePattern`, e.g. `npm test -- tests/unit/services/order.service.test.js` or `npm test -- -t "checkout"`.
- Rerun a test after each change to it.
- After the affected tests pass, ask the user to run the complete suite with `npm test`.
