import path from "node:path";
import { runVault } from "./adapters/vault.js";
import { runVelocity } from "./adapters/velocity.js";
import { runSpecter } from "./adapters/specter.js";
import { validateConfig } from "./config.js";
import { evaluateGate } from "./gate.js";
import { createReport } from "./report.js";

export async function checkProject(target = ".", config = {}) {
  const resolvedConfig = validateConfig(config);
  const isUrl = /^https?:\/\//i.test(target);
  const root = isUrl ? target : path.resolve(target);
  const enabled = {
    quality: resolvedConfig.engines.quality !== false && !isUrl,
    performance: resolvedConfig.engines.performance !== false && !isUrl,
    security: resolvedConfig.engines.security !== false
  };

  const tasks = [];
  if (enabled.quality) tasks.push(runVault(root));
  if (enabled.performance) tasks.push(runVelocity(root));
  if (enabled.security) tasks.push(runSpecter(root, resolvedConfig.security));

  const engines = await Promise.all(tasks);
  const partial = { target: root, engines };
  const gate = evaluateGate(partial, resolvedConfig.gate);
  return createReport({ ...partial, gate });
}

export { evaluateGate } from "./gate.js";
export { createFinding, engineResult, normalizeSeverity, severitySummary } from "./model.js";
export { createReport, renderTerminal } from "./report.js";
