const RANK = { info: 0, low: 1, medium: 2, high: 3, critical: 4, none: Number.POSITIVE_INFINITY };

export function evaluateGate(report, policy = {}) {
  const failOn = policy.failOn ?? "high";
  const threshold = RANK[failOn] ?? RANK.high;
  const minScores = policy.minScores ?? {};
  const reasons = [];

  for (const result of report.engines) {
    for (const finding of result.findings) {
      if ((RANK[finding.severity] ?? 0) >= threshold) {
        reasons.push(`${result.engine}:${finding.ruleId}:${finding.severity}`);
      }
    }

    const min = minScores[result.engine];
    if (Number.isFinite(min)) {
      if (!Number.isFinite(result.score)) reasons.push(`${result.engine}:score:unavailable`);
      else if (result.score < min) reasons.push(`${result.engine}:score:${result.score}<${min}`);
    }

    if (policy.requireEngines === true && result.status !== "completed") {
      reasons.push(`${result.engine}:${result.status}`);
    }
  }

  return { passed: reasons.length === 0, reasons };
}
