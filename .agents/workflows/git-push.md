---
description: Commit and push changes to GitHub following Conventional Commits and feature branching standards.
---

# Git Push & Branching Workflow

## Branching & Environment Lifecycle
- **`feat/*`, `fix/*`, `chore/*`**: Feature branches created off `dev` for active tasks.
- **`dev`**: Primary development integration branch. All feature branches merge here.
- **`staging`**: Staging & test-merge environment for QA, integration testing, and client preview.
- **`main`**: Official Production branch dedicated for NCDA turnover and production deployment.

---

```
Please follow the git push workflow below:

1. Check Active Branch & Changes:
   - Identify the current working branch: `git branch --show-current`
   - Run `git status` and `git diff` to understand the full scope of changes before staging.

2. Generate a Conventional Commit Message:
   <type>(<scope>): <description>

   [optional body]

   - Type must be one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
   - Scope is the module/domain (e.g. auth, incidents, alerts, ui, backend, frontend, testing)
   - Description must be imperative mood and concise (e.g. add PWD incident reporting form)
   - Body (if needed) should explain why, not just what
   - EXCLUSION: Do NOT include routine documentation updates, memory logs (docs/memory/), or internal markdown maintenance in commit messages unless the commit is exclusively dedicated to documentation. Focus on code, features, tests, bugfixes, and configurations.

3. Present the Proposed Commit Message & Target Branch:
   Present the proposed commit message and active branch, then ask:
   "Does this commit message and target branch look good?"

4. Execute Push After Approval:
   git add .
   git commit -m "<generated message>"
   git push origin <current-branch> (or git push -u origin <current-branch> if new)

5. Provide Push Summary:
   Report the commit SHA, branch name, and push status.

6. Next Steps & Merge Confirmation:
   - After presenting the push summary, ask the user if they would like to proceed with subsequent lifecycle actions (e.g. merging into `dev`, `staging`, or `main`, creating a pull request, or ending the session).
   - Prompt: "Would you like to proceed with merging this branch into `dev` / `staging` or perform any additional actions?"
   - **MANDATORY:** NEVER merge branches, switch branches, or delete feature branches automatically without explicit user confirmation.
```