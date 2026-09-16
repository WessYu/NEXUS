import { createFinding, engineResult } from "../model.js";

function extractScore(report) {
  const candidates = [report?.score, report?.healthScore, report?.summary?.score];
  const value = candidates.find(Number.isFinite);
  return Number.isFinite(value) ? Number(value) : null;
}

function extractFindings(report) {
  const list = Array.isArray(report?.findings)
    ? report.findings
    : Array.isArray(report?.issues)
      ? report.issues
      : Array.isArray(report?.diagnostics)
        ? report.diagnostics
        : [];

  return list.map((finding) => createFinding({
    engine: "performance",
    ruleId: finding.ruleId ?? finding.rule ?? finding.id,
    title: finding.title ?? finding.ruleId ?? finding.rule,
    message: finding.message ?? finding.description,
    severity: finding.severity ?? finding.level,
    file: finding.file ?? finding.location?.file,
    line: finding.line ?? finding.location?.line,
    column: finding.column ?? finding.location?.column,
    remediation: finding.remediation ?? finding.suggestion,
    fingerprint: finding.fingerprint
  }));
}

export async function runVelocity(root) {
  try {
    const mod = await import("@wess2001/velocity");
    const report = await mod.analyzeProject(root);
    return engineResult({
      engine: "performance",
      score: extractScore(report),
      findings: extractFindings(report),
      meta: { provider: "velocity", schemaVersion: report?.schemaVersion ?? null }
    });
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      return engineResult({ engine: "performance", status: "unavailable", errors: ["@wess2001/velocity is not installed"] });
    }
    return engineResult({ engine: "performance", status: "failed", errors: [error instanceof Error ? error.message : String(error)] });
  }
}
