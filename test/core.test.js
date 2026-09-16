import assert from "node:assert/strict";
import test from "node:test";
import { createFinding, severitySummary, engineResult } from "../src/model.js";
import { evaluateGate } from "../src/gate.js";

test("normalizes external severities", () => {
  assert.equal(createFinding({ engine: "quality", ruleId: "CV001", severity: "warning" }).severity, "medium");
  assert.equal(createFinding({ engine: "quality", ruleId: "CV002", severity: "error" }).severity, "high");
});

test("summarizes findings", () => {
  const summary = severitySummary([
    { severity: "high" },
    { severity: "high" },
    { severity: "low" }
  ]);
  assert.deepEqual(summary, { info: 0, low: 1, medium: 0, high: 2, critical: 0 });
});

test("fails the gate on severity threshold", () => {
  const report = {
    engines: [engineResult({ engine: "security", findings: [createFinding({ engine: "security", ruleId: "S1", severity: "high" })] })]
  };
  const gate = evaluateGate(report, { failOn: "high" });
  assert.equal(gate.passed, false);
  assert.deepEqual(gate.reasons, ["security:S1:high"]);
});

test("does not fake a score when an engine has none", () => {
  const result = engineResult({ engine: "quality", findings: [] });
  assert.equal(result.score, null);
});

test("can require all engines", () => {
  const report = { engines: [engineResult({ engine: "quality", status: "unavailable" })] };
  assert.equal(evaluateGate(report, { requireEngines: true }).passed, false);
});
