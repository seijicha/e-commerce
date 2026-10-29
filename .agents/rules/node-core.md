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
