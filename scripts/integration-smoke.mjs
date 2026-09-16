import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkProject } from "../src/index.js";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../test/fixtures/healthy-project",
);

const report = await checkProject(root, {
  engines: {
    quality: true,
    performance: true,
    security: true,
  },
  gate: {
    failOn: "high",
    requireEngines: true,
    minScores: {
      performance: 80,
      security: 80,
    },
  },
  security: {
    offline: true,
    build: false,
    dependencies: false,
    runtime: false,
  },
});

assert.equal(report.status, "completed", JSON.stringify(report, null, 2));
assert.equal(report.gate.passed, true, JSON.stringify(report.gate, null, 2));
assert.deepEqual(
  report.engines.map((engine) => engine.engine).sort(),
  ["performance", "quality", "security"],
);

for (const engine of report.engines) {
  assert.equal(engine.status, "completed", `${engine.engine}: ${engine.errors.join("; ")}`);
}

const performance = report.engines.find((engine) => engine.engine === "performance");
const security = report.engines.find((engine) => engine.engine === "security");

assert.ok(Number.isFinite(performance?.score));
assert.ok(performance.score >= 80, `Velocity score: ${performance.score}`);
assert.ok(Number.isFinite(security?.score));
assert.ok(security.score >= 80, `SPECTER score: ${security.score}`);

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
