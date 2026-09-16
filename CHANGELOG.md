# Changelog

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
