import { createFinding, engineResult } from "../model.js";

export async function runVault(root) {
  try {
    const mod = await import("@wess2001/component-vault");
    const report = mod.scanProject({ root });
    const findings = report.findings.map((finding) => createFinding({
      engine: "quality",
      ruleId: finding.rule ?? finding.code,
      title: finding.title,
      message: finding.message,
      severity: finding.severity,
      file: finding.file,
      line: finding.line,
      column: finding.column,
      remediation: finding.suggestion
    }));

    return engineResult({
      engine: "quality",
      findings,
      meta: { provider: "component-vault", filesScanned: report.summary?.filesScanned ?? report.files?.length ?? null }
    });
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      return engineResult({ engine: "quality", status: "unavailable", errors: ["@wess2001/component-vault is not installed"] });
    }
    return engineResult({ engine: "quality", status: "failed", errors: [error instanceof Error ? error.message : String(error)] });
  }
}
