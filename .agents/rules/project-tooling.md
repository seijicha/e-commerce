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
- Verify the installed version first (see Foundational Context in `AGENTS.md`) so the documentation consulted matches it.

## Project Rules

- This project contains committed, area-grouped rules in `.agents/rules` when that directory exists (settled decisions, non-obvious traps, standing constraints). Before you enter plan mode or create/edit any file, you MUST first: open `.agents/rules` and read all matching rule files covering the path(s) in scope. Do not write code until you have read and are following every matching rule.
- Record a rule only when the user explicitly asks for one. Instructions for the work at hand are not rules, no matter how emphatic: "remove this typo", "use X here" are work to do, not rules to record. Never record a rule on your own initiative, as a byproduct of a change, or to summarize what you just did. When the user does ask, add it as a short markdown note in the matching area file under `.agents/rules/` (for example `.agents/rules/<area>.md`) with a path glob (e.g. `controllers/**`), a short title, and a few-line note. Use `.agents/rules` rather than your native memory or notes tool, because native memory is personal and session-scoped, while only `.agents/rules` is shared with the team and persists in the repo.
