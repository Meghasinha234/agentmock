import fs from "node:fs/promises";
import path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { Cassette } from "./cassette.js";

export function createReplayServer(cassette: Cassette): Server {
  const server = new Server(
    {
      name: "agentmock-replay-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Serve recorded tool definitions
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: cassette.tools,
    };
  });

  // Serve mock responses for tool execution requests
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = cassette.tools.find((t) => t.name === name);

    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Tool '${name}' not found in recorded cassette.`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            _mock: true,
            status: "success",
            tool: name,
            receivedArguments: args || {},
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  });

  return server;
}

export async function runReplayStdio(cassettePath = ".agentmock/tools.cassette.json"): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), cassettePath);
  const rawData = await fs.readFile(absolutePath, "utf-8");
  const cassette: Cassette = JSON.parse(rawData);

  const server = createReplayServer(cassette);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
