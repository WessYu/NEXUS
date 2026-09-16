import { createFinding, engineResult } from "../model.js";

export async function runSpecter(target, options = {}) {
  try {
    const mod = await import("@wess2001/specter");
    const isUrl = /^https?:\/\//i.test(target);
    const report = isUrl
      ? await mod.executeRemoteScan(target, options)
      : await mod.executeLocalScan(target, options);

    const findings = report.findings
      .filter((finding) => finding.status !== "suppressed")
      .map((finding) =>
        createFinding({
          engine: "security",
          ruleId: finding.ruleId,
          title: finding.title,
          message: finding.description,
          severity: finding.severity,
          file: finding.location?.file,
          line: finding.location?.line,
          column: finding.location?.column,
          url: finding.location?.url,
          remediation: finding.remediation,
          fingerprint: finding.fingerprint,
        }),
      );

    const errors = (report.errors ?? []).map((error) => `${error.code}: ${error.message}`);
    return engineResult({
      engine: "security",
      status: errors.length ? "partial" : "completed",
      score: report.score?.value,
      findings,
      errors,
      meta: {
        provider: "@wess2001/specter",
        scanId: report.scanId,
        target: report.target,
      },
    });
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      return engineResult({
        engine: "security",
        status: "unavailable",
        errors: ["@wess2001/specter is not installed"],
      });
    }
    return engineResult({
      engine: "security",
      status: "failed",
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
}
