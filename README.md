<div align="center">

# NEXUS

**One engineering gate for code quality, performance, and application security.**

Quality · Performance · Security

[![npm](https://img.shields.io/npm/v/%40wess2001%2Fnexus?label=npm)](https://www.npmjs.com/package/@wess2001/nexus)
[![CI](https://github.com/WessYu/NEXUS/actions/workflows/ci.yml/badge.svg)](https://github.com/WessYu/NEXUS/actions/workflows/ci.yml)
[![Three-engine integration](https://github.com/WessYu/NEXUS/actions/workflows/engine-integration.yml/badge.svg)](https://github.com/WessYu/NEXUS/actions/workflows/engine-integration.yml)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-informational)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-informational)](LICENSE)

</div>

---

NEXUS runs three independent engineering tools through one CLI, normalizes their results into one report contract, and applies one repository-level gate.

It does **not** replace the engines or flatten them into a fake universal score.

| Engine | Signal | Responsibility |
| --- | --- | --- |
| [Component Vault](https://github.com/WessYu/component-vault) | **Quality** | component governance, design-system policy, maintainability |
| [Velocity](https://github.com/WessYu/velocity) | **Performance** | static performance risks, diagnostics, regression signals |
| [SPECTER](https://github.com/WessYu/SPECTER) | **Security** | source, dependency, build, remote, and authorized active security checks |

## Install

```bash
npm install -D @wess2001/nexus
```

That single package installs the validated engine set automatically.

Then run:

```bash
npx nexus check .
```

## What it looks like

```text
NEXUS
Quality · Performance · Security

Target: ./my-project

✓ quality       completed
✓ performance   completed
✓ security      completed

CRITICAL 0  HIGH 0

✓ ENGINEERING GATE PASSED
```

For CI or other tooling:

```bash
npx nexus check . --json
```

## Why NEXUS exists

A project can be maintainable and still be slow. It can be fast and still be insecure. It can pass security checks while quietly drifting away from its component system.

NEXUS treats those as separate engineering signals, then gives the repository a single policy decision:

> **Did this change satisfy the engineering policy we chose to enforce?**

The engines keep their own rules and evidence. NEXUS owns:

- orchestration;
- result normalization;
- configuration;
- gate evaluation;
- terminal and JSON reporting;
- integration between the three tools.

## Architecture

```text
                         ┌──────────────────────┐
                         │       PROJECT        │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
     ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
     │ Component Vault │   │    Velocity     │   │     SPECTER     │
     │     QUALITY     │   │   PERFORMANCE   │   │    SECURITY     │
     └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    ▼
                         ┌──────────────────────┐
                         │   NEXUS schema v1    │
                         └──────────┬───────────┘
                                    ▼
                         ┌──────────────────────┐
                         │  ENGINEERING GATE    │
                         └──────────────────────┘
```

NEXUS is intentionally an orchestrator, not a monolith. Engine-specific analysis stays inside the engine that owns it.

## CLI

| Command | Purpose |
| --- | --- |
| `nexus check [path\|url]` | run every enabled engine |
| `nexus quality [path]` | run Component Vault only |
| `nexus performance [path]` | run Velocity only |
| `nexus security [path\|url]` | run SPECTER only |
| `nexus doctor` | verify engine availability |
| `nexus config` | print the resolved configuration |
| `nexus version` | print the NEXUS version |

Examples:

```bash
npx nexus check .
npx nexus quality .
npx nexus performance .
npx nexus security .
npx nexus security https://example.com
npx nexus doctor
```

### Exit codes

| Code | Meaning |
| ---: | --- |
| `0` | enabled policy passed |
| `1` | engineering gate failed |
| `2` | invalid command, configuration, or execution input |

## Configuration

NEXUS reads `nexus.config.json`.

Configuration is JSON rather than executable JavaScript so repository policy remains data, not arbitrary code.

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

NEXUS rejects:

- unknown configuration keys;
- invalid values;
- score thresholds outside `0..100`;
- a configuration with every engine disabled.

A score threshold is **fail-closed**. If policy requires a score and an engine cannot provide one, the gate fails instead of inventing a value or silently passing.

Set a score threshold to `null` to disable it.

## Gate semantics

NEXUS does not manufacture an overall score.

Velocity and SPECTER expose their own documented scores, and NEXUS preserves them. Component Vault does not expose an equivalent trusted score, so NEXUS reports:

```json
{
  "engine": "quality",
  "score": null
}
```

The gate is evaluated from explicit policy:

- finding severity;
- per-engine score thresholds where a real score exists;
- engine completion requirements.

This keeps the final decision explainable.

## Report contract

Every engine result is normalized into **NEXUS schema v1**.

A normalized finding can contain:

```json
{
  "schemaVersion": "1",
  "engine": "security",
  "ruleId": "example-rule",
  "title": "Example finding",
  "message": "What was detected",
  "severity": "high",
  "file": "src/example.js",
  "line": 12,
  "remediation": "How to address it",
  "fingerprint": "stable-engine-fingerprint"
}
```

Engine execution status is one of:

```text
completed
partial
unavailable
failed
```

If any selected engine does not complete, the top-level report is marked `partial`.

The canonical schema lives at [schemas/nexus-report.schema.json](schemas/nexus-report.schema.json).

## Security boundary

NEXUS does not weaken SPECTER's authorization model.

Remote active security checks remain controlled by SPECTER's own authorization, request-budget, rate-limit, cancellation, and non-destructive testing boundaries. NEXUS cannot bypass them.

## Validated engine set

NEXUS `0.1.0` pins the engine versions that passed the release integration suite:

| Package | Version |
| --- | ---: |
| `@wess2001/component-vault` | `0.6.0` |
| `@wess2001/velocity` | `0.3.1` |
| `@wess2001/specter` | `0.1.1` |

The exact dependency graph is locked in `package-lock.json`.

## Release verification

The repository CI does more than run unit tests.

For the release package it verifies:

- Node.js 20, 22, and 24;
- syntax and unit tests;
- all three published engines are installed;
- the deterministic three-engine integration fixture passes;
- the packed NEXUS tarball installs in an empty consumer project;
- that consumer sees all three engines through `nexus doctor`;
- that consumer can run a real three-engine `nexus check`.

See [release readiness](docs/release-readiness.md) for the release contract.

## Development

```bash
git clone https://github.com/WessYu/NEXUS.git
cd NEXUS

npm ci
npm test
npm run test:integration
npm run release:check
npm run pack:check
```

## Repository structure

```text
bin/                         CLI entrypoint
src/
  adapters/                  engine boundaries
  cli.js                     command interface
  config.js                  strict policy loading
  gate.js                    engineering gate evaluation
  model.js                   normalized result model
  report.js                  terminal + JSON reporting
schemas/
  nexus-report.schema.json   public report contract
scripts/
  integration-smoke.mjs      three-engine release smoke
test/
  fixtures/                  deterministic integration fixture
  core.test.js               core contract tests
```

## License

MIT © WessYu
