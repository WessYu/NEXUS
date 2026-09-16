export const NEXUS_SCHEMA_VERSION = "1";
export const ENGINES = ["quality", "performance", "security"];

const SEVERITIES = new Set(["info", "low", "medium", "high", "critical"]);

export function normalizeSeverity(value) {
  const raw = String(value ?? "info").toLowerCase();
  if (SEVERITIES.has(raw)) return raw;
  if (["error", "fatal", "blocker"].includes(raw)) return "high";
  if (["warn", "warning"].includes(raw)) return "medium";
  return "info";
}

export function createFinding(input) {
  return {
    schemaVersion: NEXUS_SCHEMA_VERSION,
    engine: input.engine,
    ruleId: String(input.ruleId ?? "UNKNOWN"),
    title: String(input.title ?? input.ruleId ?? "Finding"),
    message: String(input.message ?? input.description ?? ""),
    severity: normalizeSeverity(input.severity),
    ...(input.file ? { file: String(input.file) } : {}),
    ...(Number.isInteger(input.line) ? { line: input.line } : {}),
    ...(Number.isInteger(input.column) ? { column: input.column } : {}),
    ...(input.url ? { url: String(input.url) } : {}),
    ...(input.remediation ? { remediation: String(input.remediation) } : {}),
    ...(input.fingerprint ? { fingerprint: String(input.fingerprint) } : {})
  };
}

export function severitySummary(findings) {
  const summary = { info: 0, low: 0, medium: 0, high: 0, critical: 0 };
  for (const finding of findings) summary[normalizeSeverity(finding.severity)] += 1;
  return summary;
}

export function engineResult({ engine, status = "completed", score = null, findings = [], errors = [], meta = {} }) {
  return {
    engine,
    status,
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Number(score))) : null,
    findings,
    summary: severitySummary(findings),
    errors,
    meta
  };
}
