# Your Oracle Clinician — prototype

Browser-based, frontend-only prototype of *Your Oracle Clinician* ("Deborah in Your Pocket").

```sh
npm i
npm run dev        # http://localhost:5173 → / (client) · /internal (tools)
npm run lint       # includes layer-boundary checks
npm run typecheck
```

Start with [CLAUDE.md](CLAUDE.md) and [docs/README.md](docs/README.md). Visual authority: [DESIGN.md](DESIGN.md) and [PRODUCT.md](PRODUCT.md). Agent surface policy: [AGENTS.md](AGENTS.md).

## Surfaces and flow versions

- **Client:** `/` — Version 2 phone with Home / Chat / Reset.
- **Internal tools:** `/internal` — password-gated prototype chrome (OTP `001001`, re-locks on refresh). Version 1 / Version 2 switch, Profile / Web / Design system / Widget Library.

See [VERSIONS.md](VERSIONS.md) for URLs, source boundaries and checks.
