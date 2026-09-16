# Contributing

NEXUS intentionally keeps orchestration separate from engine implementation.

## Development

Requirements:

- Node.js 20 or newer;
- Git.

Run:

```bash
npm test
npm run check
npm run pack:check
```

## Architecture rule

Engine-specific analysis belongs in Component Vault, Velocity or SPECTER. NEXUS should contain only:

- engine adapters;
- normalized result contracts;
- policy/configuration;
- orchestration;
- reporting;
- integration tests.

Do not duplicate engine rules in NEXUS.

## Changes to the report schema

`schemas/nexus-report.schema.json` is a public integration contract. Breaking changes require a schema-version change and migration notes.

## Pull requests

A pull request should explain:

- the user-visible behavior changed;
- the contract or engine affected;
- tests added or updated;
- whether JSON output, exit codes or CI behavior changed.
