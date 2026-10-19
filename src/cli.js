#!/usr/bin/env node
import { Command } from "commander";
import { recordTools } from "./interceptor.js";
import { runReplayStdio } from "./replay.js";
import { diffCassettes } from "./diff.js";
import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const program = new Command();
program
    .name("agentmock")
    .description("Record, replay, and detect contract drift for MCP tool calls")
    .version("0.1.0")
    .enablePositionalOptions();
// 1. RECORD COMMAND
program
    .command("record")
    .description("Spawn an MCP server, capture its tool definitions, and write a cassette")
    .argument("<command>", "Server executable command (e.g., npx, node)")
    .argument("[args...]", "Command arguments passed to the server")
    .passThroughOptions()
    .action(async (command, args) => {
    try {
        await recordTools(command, args || []);
        console.log("✅ Recording complete.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Recording failed:", error);
        process.exit(1);
    }
});
// 2. REPLAY COMMAND
program
    .command("replay")
    .description("Serve recorded tools over stdio as an in-process mock MCP server")
    .option("-c, --cassette <path>", "Path to cassette file", ".agentmock/tools.cassette.json")
    .action(async (options) => {
    try {
        await runReplayStdio(options.cassette);
    }
    catch (error) {
        console.error("❌ Replay server failed:", error);
        process.exit(1);
    }
});
// 3. DIFF COMMAND
program
    .command("diff")
    .description("Check live MCP server against recorded cassette for breaking contract drift")
    .argument("<command>", "Server executable command")
    .argument("[args...]", "Command arguments")
    .option("-c, --cassette <path>", "Path to baseline cassette", ".agentmock/tools.cassette.json")
    .passThroughOptions()
    .action(async (command, args, options) => {
    try {
        const cassettePath = path.resolve(process.cwd(), options.cassette);
        const rawData = await fs.readFile(cassettePath, "utf-8");
        const baseline = JSON.parse(rawData);
        const transport = new StdioClientTransport({ command, args: args || [] });
        const client = new Client({ name: "agentmock-diff", version: "0.1.0" }, { capabilities: {} });
        await client.connect(transport);
        const liveResponse = await client.listTools();
        await client.close();
        const liveCassette = {
            version: "1.0.0",
            recordedAt: new Date().toISOString(),
            serverCommand: command,
            serverArgs: args || [],
            tools: liveResponse.tools,
        };
        const result = diffCassettes(baseline, liveCassette);
        if (result.errors.length > 0) {
            console.error("\n❌ Breaking Schema Drift Detected:");
            result.errors.forEach((err) => console.error(`  - ${err}`));
        }
        if (result.warnings.length > 0) {
            console.warn("\n⚠️  Contract Warnings:");
            result.warnings.forEach((warn) => console.warn(`  - ${warn}`));
        }
        if (result.hasBreakingChanges) {
            console.error("\n❌ Contract check failed. Exiting with code 1.");
            process.exit(1);
        }
        else {
            console.log("\n✅ Contract check passed. Zero breaking changes.");
            process.exit(0);
        }
    }
    catch (error) {
        console.error("❌ Diff execution failed:", error);
        process.exit(1);
    }
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map