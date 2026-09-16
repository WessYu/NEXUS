import { severitySummary } from "./model.js";

export function createReport({ target, engines, gate }) {
  const findings = engines.flatMap((result) => result.findings);
  return {
    schemaVersion: "1",
    generatedAt: new Date().toISOString(),
    target,
    status: engines.some((x) => x.status === "failed") ? "partial" : "completed",
    summary: severitySummary(findings),
    engines,
    gate
  };
}

export function renderTerminal(report) {
  const lines = [
    "NEXUS",
    "Quality · Performance · Security",
    "",
    `Target: ${report.target}`,
    "",
    ...report.engines.map((result) => {
      const icon = result.status === "completed" ? "✓" : result.status === "unavailable" ? "-" : "!";
      const score = Number.isFinite(result.score) ? ` ${result.score}/100` : "";
      return `${icon} ${result.engine.padEnd(12)} ${result.status}${score} · ${result.findings.length} findings`;
    }),
    "",
    `CRITICAL ${report.summary.critical}  HIGH ${report.summary.high}  MEDIUM ${report.summary.medium}  LOW ${report.summary.low}  INFO ${report.summary.info}`,
    "",
    report.gate.passed ? "✓ ENGINEERING GATE PASSED" : "✗ ENGINEERING GATE FAILED"
  ];

  if (!report.gate.passed) lines.push(...report.gate.reasons.map((reason) => `  - ${reason}`));
  return `${lines.join("\n")}\n`;
}
