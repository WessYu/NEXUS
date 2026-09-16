import path from "node:path";
import { checkProject } from "./index.js";
import { loadConfig } from "./config.js";
import { renderTerminal } from "./report.js";

const VERSION = "0.1.0-dev.0";

function help() {
  return `NEXUS v${VERSION}
One engineering gate for quality, performance, and security.

COMMANDS
  nexus check [path|url]       run all enabled engines
  nexus quality [path]         run Component Vault only
  nexus performance [path]     run Velocity only
  nexus security [path|url]    run SPECTER only
  nexus doctor                 inspect engine availability
  nexus config                 print resolved configuration
  nexus version                print version

FLAGS
  --json                       machine-readable report
  --config <file>              use another JSON config
`;
}

function parse(args) {
  const positional = [];
  let json = false;
  let configPath;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--json") json = true;
    else if (arg === "--config") configPath = args[++i];
    else positional.push(arg);
  }
  return { positional, json, configPath };
}

async function doctor(cwd, json) {
  const packages = [
    ["quality", "@wess2001/component-vault"],
    ["performance", "@wess2001/velocity"],
    ["security", "@wess2001/specter"]
  ];
  const results = [];
  for (const [engine, packageName] of packages) {
    try {
      await import(packageName);
      results.push({ engine, package: packageName, available: true });
    } catch (error) {
      results.push({ engine, package: packageName, available: false, reason: error?.code === "ERR_MODULE_NOT_FOUND" ? "not installed" : error.message });
    }
  }
  if (!results.find((x) => x.engine === "security")?.available) {
    try {
      await import("@specter-security/cli");
      const item = results.find((x) => x.engine === "security");
      item.available = true;
      item.package = "@specter-security/cli";
      delete item.reason;
    } catch {}
  }
  const body = { cwd: path.resolve(cwd), node: process.version, engines: results };
  return json ? `${JSON.stringify(body, null, 2)}\n` : `${results.map((x) => `${x.available ? "✓" : "-"} ${x.engine}: ${x.package}${x.reason ? ` (${x.reason})` : ""}`).join("\n")}\n`;
}

export async function runCli({ cwd, args }) {
  const { positional, json, configPath } = parse(args);
  const [command = "help", target = "."] = positional;

  if (["help", "--help", "-h"].includes(command)) return { exitCode: 0, stdout: help() };
  if (["version", "--version", "-v"].includes(command)) return { exitCode: 0, stdout: `${VERSION}\n` };
  if (command === "doctor") return { exitCode: 0, stdout: await doctor(cwd, json) };

  let loaded;
  try {
    loaded = await loadConfig(cwd, configPath);
  } catch (error) {
    return { exitCode: 2, stderr: `${error.message}\n` };
  }

  if (command === "config") {
    return { exitCode: 0, stdout: `${JSON.stringify(loaded, null, 2)}\n` };
  }

  const config = structuredClone(loaded.config);
  if (command === "quality") config.engines = { quality: true, performance: false, security: false };
  else if (command === "performance") config.engines = { quality: false, performance: true, security: false };
  else if (command === "security") config.engines = { quality: false, performance: false, security: true };
  else if (command !== "check") return { exitCode: 2, stderr: `Unknown command: ${command}\n` };

  const report = await checkProject(target, config);
  return {
    exitCode: report.gate.passed ? 0 : 1,
    stdout: json ? `${JSON.stringify(report, null, 2)}\n` : renderTerminal(report)
  };
}
