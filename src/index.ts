import fs from "node:fs/promises";
import path from "node:path";
import type { Cassette } from "./cassette.js";
import { diffCassettes } from "./diff.js";

async function run() {
  console.log("=== AgentMock Diff & Drift Simulation ===");

  const cassettePath = path.resolve(process.cwd(), ".agentmock/tools.cassette.json");
  const rawData = await fs.readFile(cassettePath, "utf-8");
  const baseline: Cassette = JSON.parse(rawData);

  // Clone cassette and simulate incoming breaking changes
  const mutatedCurrent: Cassette = JSON.parse(JSON.stringify(baseline));

  // Simulation 1: Add a mandatory 'precision' parameter to 'add'
  const addTool = mutatedCurrent.tools.find((t) => t.name === "add");
  if (addTool) {
    addTool.inputSchema.required = [...(addTool.inputSchema.required || []), "precision"];
  }

  // Simulation 2: Delete 'echo' tool completely
  mutatedCurrent.tools = mutatedCurrent.tools.filter((t) => t.name !== "echo");

  // Run the diff comparison
  const result = diffCassettes(baseline, mutatedCurrent);

  console.log("\nDetected Violations:");
  result.errors.forEach((err) => console.log(`  ❌ ${err}`));
  result.warnings.forEach((warn) => console.log(`  ⚠️  ${warn}`));

  if (result.hasBreakingChanges) {
    console.log("\n❌ CI Check: FAILED (Breaking changes caught before hitting production).");
  } else {
    console.log("\n✅ CI Check: PASSED (Backwards compatible).");
  }
}

run().catch((error) => {
  console.error("[AgentMock Error]:", error);
  process.exit(1);
});
