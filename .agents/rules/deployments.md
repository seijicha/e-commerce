# Deployment

- The hosting platform is not yet decided; do not add platform-specific configuration, CI or deployment files without approval.
- Production configuration must come from environment variables only (`NODE_ENV=production`, secure session cookies, a strong `SESSION_SECRET`, database credentials). Never commit secrets.
- Before suggesting a deployment change, confirm the production checklist in `docs/architecture/architecture.md` (security section) is satisfied.
