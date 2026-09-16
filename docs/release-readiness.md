# Release readiness

NEXUS is ready for a public npm release only when all items below are true.

## Engine contracts

- [ ] `@wess2001/component-vault` is available from npm at a compatible version.
- [ ] `@wess2001/velocity` is available from npm at a compatible version.
- [ ] `@wess2001/specter` is available from npm and its external-consumer smoke passes.
- [ ] NEXUS integration CI runs all three engines against a deterministic fixture.

## Package

- [x] CLI and programmatic API are separate from the engines.
- [x] JSON report schema is versioned.
- [x] Missing or partial engines are represented explicitly.
- [x] Score thresholds fail closed when a required score cannot be verified.
- [x] Configuration rejects unknown and invalid policy.
- [x] Tarball installs and runs outside the repository on CI.
- [ ] Engine packages move from optional peers to normal dependencies for the first complete meta-package release.
- [ ] Exact npm tarball and provenance are validated before publication.

## Product claims

NEXUS may be described as an engineering-gate orchestrator today. It should not be described as a one-command complete suite until the three engine packages are installable through the published NEXUS package and the integration job is green.
