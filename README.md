# AgentMock

A lightweight CLI developer tool to record, replay, and detect breaking changes for Model Context Protocol (MCP) servers.

## What Problem Does It Solve?

When AI agents use MCP tools (like databases, Stripe, or Jira):
- **Live testing is slow and expensive:** Booting full servers takes seconds, hits rate limits, and risks writing junk data to live databases during test runs.
- **Tools break silently:** If a backend team deletes a tool or adds a mandatory field, LLMs don't fail with compiler errors—they hallucinate or break midway through execution.

## Core Features

- **Record:** Connects to any MCP server and saves tool definitions into a local JSON cassette.
- **Replay:** Serves recorded tools in-process over standard I/O in under 4ms—completely offline with zero API costs.
- **Diff:** Runs in CI (GitHub Actions) to compare the live server against the recorded contract. It fails the build with exit code 1 if breaking changes (deleted tools, mutated types, new required fields) are introduced.

## Quick Start

    git clone [https://github.com/Meghasinha234/agentmock.git](https://github.com/Meghasinha234/agentmock.git)
    cd agentmock
    npm install
    npm run build

## CLI Usage

    # 1. Record an MCP server
    ./dist/cli.js record npx -y @modelcontextprotocol/server-everything

    # 2. Replay tools offline for local tests
    ./dist/cli.js replay

    # 3. Detect breaking schema changes in CI
    ./dist/cli.js diff npx -y @modelcontextprotocol/server-everything

## Tech Stack

- **TypeScript / Node.js** (NodeNext ESM)
- **@modelcontextprotocol/sdk** (Official Anthropic SDK for stdio & in-memory transports)
- **Zod** (Schema validation)
- **Commander** (CLI interface)
- **GitHub Actions** (Automated CI contract testing)
