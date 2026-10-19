import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "node:fs/promises";
import path from "node:path";

export interface ToolDefinition {
  name: string;
  description?: string;
  inputSchema: Record<string, any>;
}

export interface Cassette {
  version: string;
  serverCommand: string;
  recordedAt: string;
  tools: ToolDefinition[];
}

export async function recordTools(command: string, args: string[] = []): Promise<Cassette> {
  console.log(`[AgentMock] Connecting to MCP server via stdio: ${command} ${args.join(" ")}`);

  // 1. Launch the real MCP server process and establish stdio communication
  const transport = new StdioClientTransport({
    command,
    args,
  });

  const client = new Client(
    { name: "agentmock-recorder", version: "0.1.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("[AgentMock] Handshake complete. Fetching tool list...");

  // 2. Discover tool definitions using the official tools/list JSON-RPC method
  const response = await client.listTools();
  console.log(`[AgentMock] Discovered ${response.tools.length} tool(s).`);

  // 3. Structure the cassette record
  const cassette: Cassette = {
    version: "1.0.0",
    serverCommand: `${command} ${args.join(" ")}`.trim(),
    recordedAt: new Date().toISOString(),
    tools: response.tools,
  };

  // 4. Save to local .agentmock directory
  const outputDir = path.resolve(process.cwd(), ".agentmock");
  await fs.mkdir(outputDir, { recursive: true });

  const cassettePath = path.join(outputDir, "tools.cassette.json");
  await fs.writeFile(cassettePath, JSON.stringify(cassette, null, 2), "utf-8");

  console.log(`[AgentMock] Tool definitions successfully written to: ${cassettePath}`);

  // 5. Cleanly shut down client process
  await client.close();

  return cassette;
}