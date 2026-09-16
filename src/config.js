import fs from "node:fs/promises";
import path from "node:path";

const ENGINE_NAMES = ["quality", "performance", "security"];
const FAIL_LEVELS = new Set(["critical", "high", "medium", "low", "none"]);

export const defaultConfig = Object.freeze({
  engines: { quality: true, performance: true, security: true },
  gate: {
    failOn: "high",
    requireEngines: false,
    minScores: { performance: 80, security: 80 },
  },
  security: { offline: false, build: true, dependencies: true, runtime: false },
});

function objectValue(value, name) {
  if (value === undefined) return {};
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value;
}

function rejectUnknown(value, allowed, name) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`Unknown ${name} keys: ${unknown.join(", ")}`);
}

export function validateConfig(input = {}) {
  const root = objectValue(input, "config");
  rejectUnknown(root, new Set(["engines", "gate", "security"]), "config");

  const enginesInput = objectValue(root.engines, "engines");
  rejectUnknown(enginesInput, new Set(ENGINE_NAMES), "engines");
  const engines = { ...defaultConfig.engines };
  for (const name of ENGINE_NAMES) {
    if (enginesInput[name] === undefined) continue;
    if (typeof enginesInput[name] !== "boolean") throw new Error(`engines.${name} must be boolean`);
    engines[name] = enginesInput[name];
  }

  const gateInput = objectValue(root.gate, "gate");
  rejectUnknown(gateInput, new Set(["failOn", "requireEngines", "minScores"]), "gate");
  const failOn = gateInput.failOn ?? defaultConfig.gate.failOn;
  if (!FAIL_LEVELS.has(failOn)) {
    throw new Error("gate.failOn must be critical, high, medium, low or none");
  }
  const requireEngines = gateInput.requireEngines ?? defaultConfig.gate.requireEngines;
  if (typeof requireEngines !== "boolean") throw new Error("gate.requireEngines must be boolean");

  const minScoresInput = objectValue(gateInput.minScores, "gate.minScores");
  rejectUnknown(minScoresInput, new Set(ENGINE_NAMES), "gate.minScores");
  const minScores = { ...defaultConfig.gate.minScores };
  for (const name of ENGINE_NAMES) {
    if (!(name in minScoresInput)) continue;
    const value = minScoresInput[name];
    if (value === null) {
      delete minScores[name];
      continue;
    }
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error(`gate.minScores.${name} must be null or a number between 0 and 100`);
    }
    minScores[name] = value;
  }

  const securityInput = objectValue(root.security, "security");
  const securityKeys = ["offline", "build", "dependencies", "runtime"];
  rejectUnknown(securityInput, new Set(securityKeys), "security");
  const security = { ...defaultConfig.security };
  for (const key of securityKeys) {
    if (securityInput[key] === undefined) continue;
    if (typeof securityInput[key] !== "boolean") throw new Error(`security.${key} must be boolean`);
    security[key] = securityInput[key];
  }

  if (!Object.values(engines).some(Boolean)) {
    throw new Error("At least one engine must be enabled");
  }

  return {
    engines,
    gate: { failOn, requireEngines, minScores },
    security,
  };
}

export async function loadConfig(cwd, explicitPath) {
  const configPath = explicitPath
    ? path.resolve(cwd, explicitPath)
    : path.join(cwd, "nexus.config.json");

  try {
    const raw = await fs.readFile(configPath, "utf8");
    return { path: configPath, config: validateConfig(JSON.parse(raw)) };
  } catch (error) {
    if (error?.code === "ENOENT") return { path: null, config: validateConfig({}) };
    throw new Error(`Invalid NEXUS config: ${error instanceof Error ? error.message : String(error)}`);
  }
}
