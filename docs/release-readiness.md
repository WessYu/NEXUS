# Release readiness

NEXUS is ready for a complete public npm release only when all items below are true.

## Engine contracts

- [x] `@wess2001/component-vault@0.6.0` is available from npm.
- [x] `@wess2001/velocity@0.3.1` is available from npm.
- [ ] `@wess2001/specter@0.1.0` is available from npm.
- [x] The public SPECTER facade installs and runs from an external packed tarball.
- [x] NEXUS integration CI runs all three engines against a deterministic fixture.
- [x] The three-engine integration passes against SPECTER `main`.

## Package

- [x] CLI and programmatic API are separate from the engines.
- [x] JSON report schema is versioned.
- [x] Missing or partial engines are represented explicitly.
- [x] Score thresholds fail closed when a required score cannot be verified.
- [x] Configuration rejects unknown and invalid policy.
- [x] The NEXUS tarball installs and runs outside the repository on CI.
- [ ] Engine packages move from optional peers to normal dependencies for the first complete meta-package release.
- [ ] NEXUS version is promoted from the development version to the first release version.
- [ ] Exact NEXUS npm tarball and provenance are validated before publication.

## Current blocker

SPECTER is merged and its public package facade plus trusted-publishing workflow are in `main`. The remaining external step is the first npm publication of `@wess2001/specter@0.1.0`.

After that publication:

1. switch NEXUS three-engine CI from the SPECTER source tarball to the npm package;
2. move the three engine packages from optional peers to normal dependencies;
3. run the integration and external-consumer gates again;
4. promote NEXUS to its first release version and publish the validated tarball.

## Product claims

NEXUS can be described today as a tested engineering-gate orchestrator for Component Vault, Velocity and SPECTER. It should be described as a one-command distributable suite only after the three engine packages are installed by the published NEXUS package itself.
