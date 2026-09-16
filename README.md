# NEXUS

**One engineering gate for code quality, performance and application security.**

NEXUS orchestrates three independent developer tools through one CLI and one versioned report contract:

| Engine | Responsibility |
| --- | --- |
| Component Vault | component governance, design-system policy and maintainability |
| Velocity | static performance risks and health scoring |
| SPECTER | application security from source to deployed applications |

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

NEXUS does not reimplement engine rules. Each tool remains independently installable and usable; NEXUS owns orchestration, normalization and policy.

## Status

Current development version: **0.1.0-dev.1**.

The orchestrator, schema, strict configuration, fail-closed gate behavior and package CI are implemented. The complete meta-package release remains blocked until the public SPECTER package is merged/published and a three-engine integration smoke is green.

See [release readiness](docs/release-readiness.md) for the exact checklist.

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

Use JSON output for CI and integrations:

```bash
nexus check . --json
```

Exit codes:

- `0` — enabled policy passed;
- `1` — engineering gate failed;
- `2` — invalid command or configuration.

## Configuration

NEXUS loads JSON rather than executable JavaScript so repository policy is data, not code.

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
  },
  "security": {
    "offline": false,
    "build": true,
    "dependencies": true,
    "runtime": false
  }
}
```

Unknown keys and invalid values are rejected.

A score threshold is fail-closed: if policy requires a score and the engine cannot provide one, the gate fails instead of inventing a value or silently passing.

Set a score entry to `null` to disable that score threshold.

## Report contract

All engines are normalized into NEXUS schema v1.

A normalized finding identifies:

- source engine;
- rule;
- severity;
- message;
- source location when available;
- remediation when available;
- stable fingerprint when supplied by the engine.

Engine execution can be `completed`, `partial`, `unavailable` or `failed`. A report is marked `partial` whenever any selected engine did not complete.

The JSON schema is committed at [schemas/nexus-report.schema.json](schemas/nexus-report.schema.json).

## Scores

NEXUS does **not** manufacture a universal score.

Velocity and SPECTER expose their own documented scores, which NEXUS preserves. If an engine does not expose a trustworthy score, NEXUS reports `score: null`.

This avoids presenting unrelated heuristics as though they were one mathematically comparable metric.

## Engine packages

NEXUS targets:

```text
@wess2001/component-vault
@wess2001/velocity
@wess2001/specter
```

During the current pre-release line these are optional peers so the orchestrator and individual adapters can be validated independently. The first complete meta-package release should install the compatible engine set directly after all three public package contracts are validated.

## Development

```bash
npm test
npm run check
npm run pack:check
```

CI validates Node.js 20, 22 and 24 and installs the packed NEXUS tarball outside the repository to verify the distributed CLI rather than only the source checkout.

## Design principle

NEXUS answers a repository-level question:

> **Did this change satisfy the engineering policy we chose to enforce?**

The three engines answer different evidence questions. NEXUS should preserve those distinctions rather than flattening them into marketing claims.

## License

MIT © WessYu
