import { createFinding, engineResult } from "../model.js";

async function loadSpecter() {
  const candidates = ["@wess2001/specter", "@specter-security/cli"];
  let lastError;
  for (const name of candidates) {
    try {
      return { name, mod: await import(name) };
    } catch (error) {
      lastError = error;
      if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
    }
  }
  throw lastError ?? new Error("SPECTER package is not installed");
}

export async function runSpecter(target, options = {}) {
  try {
    const { name, mod } = await loadSpecter();
    const isUrl = /^https?:\/\//i.test(target);
    const report = isUrl
      ? await mod.executeRemoteScan(target, options)
      : await mod.executeLocalScan(target, options);

    const findings = report.findings
      .filter((finding) => finding.status !== "suppressed")
      .map((finding) => createFinding({
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
        fingerprint: finding.fingerprint
      }));

    return engineResult({
      engine: "security",
      score: report.score?.value,
      findings,
      errors: (report.errors ?? []).map((error) => `${error.code}: ${error.message}`),
      meta: { provider: name, scanId: report.scanId, target: report.target }
    });
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      return engineResult({ engine: "security", status: "unavailable", errors: ["SPECTER package is not installed"] });
    }
    return engineResult({ engine: "security", status: "failed", errors: [error instanceof Error ? error.message : String(error)] });
  }
}
