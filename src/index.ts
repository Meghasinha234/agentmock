import { recordTools } from "./interceptor.js";

async function run() {
  console.log("=== AgentMock Core Engine Starting ===");

  // Demo target: official sample MCP server with prebuilt dummy tools
  const command = "npx";
  const args = ["-y", "@modelcontextprotocol/server-everything"];

  await recordTools(command, args);

  console.log("=== Recording Complete ===");
}

run().catch((error) => {
  console.error("[AgentMock Error]:", error);
  process.exit(1);
});