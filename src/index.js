import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createReplayServer } from "./replay.js";
async function verifyReplay() {
    console.log("=== AgentMock Replay Engine Verification ===");
    const cassettePath = path.resolve(process.cwd(), ".agentmock/tools.cassette.json");
    const rawData = await fs.readFile(cassettePath, "utf-8");
    const cassette = JSON.parse(rawData);
    const server = createReplayServer(cassette);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    const client = new Client({ name: "agent-test-runner", version: "0.1.0" }, { capabilities: {} });
    await client.connect(clientTransport);
    // 1. Verify Tool Listing & Latency
    const start = performance.now();
    const toolsResult = await client.listTools();
    const duration = (performance.now() - start).toFixed(2);
    console.log(`\n[Replay Engine] Replayed ${toolsResult.tools.length} tool(s) from cassette in ${duration}ms.`);
    // 2. Verify Mock Execution
    const callResult = await client.callTool({
        name: "echo",
        arguments: { message: "Verifying offline agent workflow" },
    });
    console.log("\n[Replay Engine] Mock Tool Call Response:");
    console.log(JSON.stringify(callResult, null, 2));
    await client.close();
    await server.close();
}
verifyReplay().catch((err) => {
    console.error("[Replay Verification Error]:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map