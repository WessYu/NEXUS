# NEXUS

**One engineering gate for code quality, performance, and application security.**

NEXUS orchestrates three independent engines without turning them into one monolith:

- **Component Vault** → component governance and maintainability
- **Velocity** → performance diagnostics and regression analysis
- **SPECTER** → application security from source to production

```text
Project
  │
  ├── Component Vault ──▶ Quality
  ├── Velocity        ──▶ Performance
  └── SPECTER         ──▶ Security
            │
            ▼
      NEXUS schema v1
            │
            ▼
      Engineering Gate
```

## Status

`0.1.0-dev.0` is an integration scaffold. Component Vault and Velocity already expose public programmatic APIs. SPECTER still needs a public consumable package/facade before NEXUS can be released as a complete npm meta-package.

## CLI

```bash
nexus check .
nexus quality .
nexus performance .
nexus security .
nexus security https://example.com
nexus doctor
nexus config
```

Machine-readable output:

```bash
nexus check . --json
```

## Configuration

NEXUS deliberately starts with JSON configuration so loading policy does not execute repository code.

```json
{
  "engines": {
    "quality": true,
    "performance": true,
    "security": true
  },
  "gate": {
    "failOn": "high",
    "requireEngines": true,
    "minScores": {
      "performance": 80,
      "security": 85
    }
  }
}
```

NEXUS does not fabricate an engine score. If an engine does not expose a trustworthy score, its normalized result uses `score: null`; the gate can still use severity findings and availability policy.

## Release prerequisite

Before publishing NEXUS as a complete package, SPECTER should expose a single public package (recommended: `@wess2001/specter`) containing the CLI/programmatic scan API without requiring consumers to install its private workspace graph.

## License

MIT.
