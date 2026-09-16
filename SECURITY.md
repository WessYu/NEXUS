# Security policy

NEXUS is an orchestrator. Security findings are produced by its engine packages, while NEXUS is responsible for configuration, normalization and gate behavior.

## Reporting a vulnerability

Do not publish a proof of concept containing credentials, secrets or exploit data in a public issue.

Report security issues through GitHub's private vulnerability reporting feature for this repository when available. Include:

- the affected NEXUS version or commit;
- the command/configuration involved;
- the smallest safe reproduction;
- expected and observed behavior;
- whether the issue affects NEXUS itself or one of its engines.

Engine-specific scanner vulnerabilities should also be reported to the corresponding upstream repository.

## Supported versions

NEXUS is currently pre-release. Only the latest development line receives fixes.

## Trust boundaries

NEXUS does not treat a green gate as proof that an application is secure, fast or correct. It reports and gates on evidence produced by the enabled engines and on the policy supplied by the repository.

Missing evidence is not silently converted into a passing score.
