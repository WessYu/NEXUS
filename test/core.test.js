import assert from "node:assert/strict";
import test from "node:test";
import { validateConfig } from "../src/config.js";
import { evaluateGate } from "../src/gate.js";
import { createFinding, engineResult, severitySummary } from "../src/model.js";
import { createReport } from "../src/report.js";

test("normalizes external severities", () => {
  assert.equal(
    createFinding({ engine: "quality", ruleId: "CV001", severity: "warning" }).severity,
    "medium",
  );
  assert.equal(
    createFinding({ engine: "quality", ruleId: "CV002", severity: "error" }).severity,
    "high",
  );
});

test("summarizes findings", () => {
  const summary = severitySummary([
    { severity: "high" },
    { severity: "high" },
    { severity: "low" },
  ]);
  assert.deepEqual(summary, { info: 0, low: 1, medium: 0, high: 2, critical: 0 });
});

test("fails the gate on severity threshold", () => {
  const report = {
    engines: [
      engineResult({
        engine: "security",
        findings: [createFinding({ engine: "security", ruleId: "S1", severity: "high" })],
      }),
    ],
  };
  const gate = evaluateGate(report, { failOn: "high" });
  assert.equal(gate.passed, false);
  assert.deepEqual(gate.reasons, ["security:S1:high"]);
});

test("failOn none disables finding severity gate", () => {
  const report = {
    engines: [
      engineResult({
        engine: "security",
        findings: [createFinding({ engine: "security", ruleId: "S1", severity: "critical" })],
      }),
    ],
  };
  assert.equal(evaluateGate(report, { failOn: "none" }).passed, true);
});

test("does not fake a score when an engine has none", () => {
  const result = engineResult({ engine: "quality", findings: [] });
  assert.equal(result.score, null);
});

test("configured score threshold fails when score is unavailable", () => {
  const report = { engines: [engineResult({ engine: "quality", findings: [] })] };
  const gate = evaluateGate(report, { minScores: { quality: 80 } });
  assert.deepEqual(gate, { passed: false, reasons: ["quality:score:unavailable"] });
});

test("can require complete engines", () => {
  const report = { engines: [engineResult({ engine: "security", status: "partial" })] };
  const gate = evaluateGate(report, { requireEngines: true });
  assert.deepEqual(gate, { passed: false, reasons: ["security:partial"] });
});

test("report becomes partial when an engine is unavailable", () => {
  const report = createReport({
    target: ".",
    engines: [engineResult({ engine: "performance", status: "unavailable" })],
    gate: { passed: true, reasons: [] },
  });
  assert.equal(report.status, "partial");
});

test("validates and merges configuration", () => {
  const config = validateConfig({
    engines: { security: false },
    gate: { failOn: "medium", minScores: { performance: 90, security: null } },
    security: { offline: true },
  });

  assert.equal(config.engines.quality, true);
  assert.equal(config.engines.security, false);
  assert.equal(config.gate.failOn, "medium");
  assert.equal(config.gate.minScores.performance, 90);
  assert.equal("security" in config.gate.minScores, false);
  assert.equal(config.security.offline, true);
});

test("rejects unknown or invalid configuration", () => {
  assert.throws(() => validateConfig({ surprise: true }), /Unknown config keys/);
  assert.throws(() => validateConfig({ engines: { quality: "yes" } }), /must be boolean/);
  assert.throws(
    () => validateConfig({ gate: { minScores: { performance: 101 } } }),
    /between 0 and 100/,
  );
  assert.throws(
    () =>
      validateConfig({
        engines: { quality: false, performance: false, security: false },
      }),
    /At least one engine must be enabled/,
  );
});
