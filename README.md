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

Release version: **0.1.0**.

The complete three-engine integration is green against the published npm packages: Component Vault 0.6.0, Velocity 0.3.1 and SPECTER 0.1.1.

NEXUS 0.1.0 installs those engines directly and is now published to npm as `@wess2001/nexus@0.1.0`.

See [release readiness](docs/release-readiness.md) for the exact checklist.

## Install

```bash
npm install -D @wess2001/nexus
```

The NEXUS package installs the compatible Component Vault, Velocity and SPECTER engines automatically.

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

NEXUS 0.1.0 pins the validated engine set as normal dependencies:

- `@wess2001/component-vault@0.6.0`
- `@wess2001/velocity@0.3.1`
- `@wess2001/specter@0.1.1`

The lockfile and CI both resolve these exact npm artifacts.

## Development

```bash
npm ci
npm test
npm run test:integration
npm run release:check
npm run pack:check
```

CI validates Node.js 20, 22 and 24 and installs the packed NEXUS tarball outside the repository to verify the distributed CLI rather than only the source checkout.

## Design principle

NEXUS answers a repository-level question:

> **Did this change satisfy the engineering policy we chose to enforce?**

The three engines answer different evidence questions. NEXUS should preserve those distinctions rather than flattening them into marketing claims.

## License

MIT © WessYu
