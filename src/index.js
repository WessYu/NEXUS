import path from "node:path";
import { runVault } from "./adapters/vault.js";
import { runVelocity } from "./adapters/velocity.js";
import { runSpecter } from "./adapters/specter.js";
import { evaluateGate } from "./gate.js";
import { createReport } from "./report.js";

export async function checkProject(target = ".", config = {}) {
  const isUrl = /^https?:\/\//i.test(target);
  const root = isUrl ? target : path.resolve(target);
  const enabled = {
    quality: config.engines?.quality !== false && !isUrl,
    performance: config.engines?.performance !== false && !isUrl,
    security: config.engines?.security !== false
  };

  const tasks = [];
  if (enabled.quality) tasks.push(runVault(root));
  if (enabled.performance) tasks.push(runVelocity(root));
  if (enabled.security) tasks.push(runSpecter(root, config.security ?? {}));

  const engines = await Promise.all(tasks);
  const partial = { target: root, engines };
  const gate = evaluateGate(partial, config.gate ?? {});
  return createReport({ ...partial, gate });
}

export { evaluateGate } from "./gate.js";
export { createFinding, engineResult, normalizeSeverity, severitySummary } from "./model.js";
export { createReport, renderTerminal } from "./report.js";
