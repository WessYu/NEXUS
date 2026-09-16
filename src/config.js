import fs from "node:fs/promises";
import path from "node:path";

export const defaultConfig = Object.freeze({
  engines: { quality: true, performance: true, security: true },
  gate: {
    failOn: "high",
    requireEngines: false,
    minScores: { performance: 80, security: 80 }
  },
  security: { offline: false, build: true, dependencies: true, runtime: false }
});

export async function loadConfig(cwd, explicitPath) {
  const configPath = explicitPath ? path.resolve(cwd, explicitPath) : path.join(cwd, "nexus.config.json");
  try {
    const raw = await fs.readFile(configPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      path: configPath,
      config: {
        ...defaultConfig,
        ...parsed,
        engines: { ...defaultConfig.engines, ...(parsed.engines ?? {}) },
        gate: {
          ...defaultConfig.gate,
          ...(parsed.gate ?? {}),
          minScores: { ...defaultConfig.gate.minScores, ...(parsed.gate?.minScores ?? {}) }
        },
        security: { ...defaultConfig.security, ...(parsed.security ?? {}) }
      }
    };
  } catch (error) {
    if (error?.code === "ENOENT") return { path: null, config: structuredClone(defaultConfig) };
    throw new Error(`Invalid NEXUS config: ${error instanceof Error ? error.message : String(error)}`);
  }
}
