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
