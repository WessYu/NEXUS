# Release readiness

NEXUS 0.1.0 is technically ready for its first npm publication when the release branch CI is green.

## Engine contracts

- [x] `@wess2001/component-vault@0.6.0` is available from npm.
- [x] `@wess2001/velocity@0.3.1` is available from npm.
- [x] `@wess2001/specter@0.1.1` is available from npm.
- [x] NEXUS integration CI runs all three published engines against a deterministic fixture.
- [x] The three engine versions are locked in `package-lock.json`.

## Package

- [x] CLI and programmatic API are separate from the engines.
- [x] JSON report schema is versioned and has a resolvable canonical ID.
- [x] Missing or partial engines are represented explicitly.
- [x] Score thresholds fail closed when a required score cannot be verified.
- [x] Configuration rejects unknown, invalid and no-op engine policy.
- [x] Engine packages are normal NEXUS dependencies.
- [x] NEXUS version is promoted to `0.1.0`.
- [x] CI installs the packed NEXUS tarball outside the repository.
- [x] Consumer smoke verifies that installing only NEXUS also installs all three engines.
- [x] Consumer smoke executes a real three-engine `nexus check`.
- [ ] `@wess2001/nexus@0.1.0` is published to npm.

## Release procedure

For the first npm publication:

1. merge the green `release/0.1.0` pull request;
2. pull `main` locally;
3. run `npm ci` and `npm run release:check`;
4. create the exact tarball with `npm pack`;
5. publish that tarball as public.

After the first package exists in npm, future releases can use GitHub Trusted Publishing with provenance.

## Product claim

Once the final npm publication succeeds, NEXUS 0.1.0 is a one-command distributable engineering suite that orchestrates code quality/governance, performance and application security without flattening the engines into a fabricated universal score.
