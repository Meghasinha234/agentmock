import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "node:fs/promises";
import path from "node:path";
export async function recordTools(command, args) {
    console.log(`[AgentMock] Connecting to MCP server via stdio: ${command} ${args.join(" ")}`);
    const transport = new StdioClientTransport({
        command,
        args,
    });
    const client = new Client({
        name: "agentmock-recorder",
        version: "0.1.0",
    }, {
        capabilities: {},
    });
    await client.connect(transport);
    console.log("[AgentMock] Handshake complete. Fetching tool list...");
    const response = await client.listTools();
    console.log(`[AgentMock] Discovered ${response.tools.length} tool(s).`);
    const cassette = {
        version: "1.0.0",
        recordedAt: new Date().toISOString(),
        serverCommand: command,
        serverArgs: args,
        tools: response.tools,
    };
    const outputDir = path.resolve(process.cwd(), ".agentmock");
    await fs.mkdir(outputDir, { recursive: true });
    const outputFile = path.join(outputDir, "tools.cassette.json");
    await fs.writeFile(outputFile, JSON.stringify(cassette, null, 2), "utf-8");
    console.log(`[AgentMock] Tool definitions successfully written to: ${outputFile}`);
    await client.close();
    return cassette;
}
//# sourceMappingURL=interceptor.js.map