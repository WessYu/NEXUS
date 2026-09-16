# Changelog

## 0.1.0 - 2026-09-16

- Promoted NEXUS to its first complete release.
- Added Component Vault 0.6.0, Velocity 0.3.1 and SPECTER 0.1.1 as direct dependencies.
- Added a reproducible npm lockfile for the validated engine set.
- Switched three-engine CI from a source-built SPECTER tarball to the published npm package.
- Added external consumer validation proving that installing only NEXUS installs and executes all three engines.
- Added fail-closed protection against a configuration with every engine disabled.
- Added a resolvable canonical URL for the NEXUS report schema.
- Added release-gate and npm publishing workflows.

All notable changes to NEXUS are documented here.

## 0.1.0-dev.1 - 2026-09-16

- Added strict configuration validation and fail-closed score gates.
- Added explicit partial engine/report states.
- Aligned the Velocity adapter with its published report contract.
- Switched the security adapter to the public `@wess2001/specter` contract.
- Added Node.js 20/22/24 CI, syntax checks, unit tests and external tarball smoke validation.
- Added release-readiness documentation and package repository metadata.

## 0.1.0-dev.0 - 2026-09-16

- Initial NEXUS orchestrator.
- Added Component Vault, Velocity and SPECTER adapters.
- Added unified finding model, JSON schema and engineering gate.
- Added CLI commands for full and per-engine checks.
