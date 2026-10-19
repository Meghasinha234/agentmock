import { Cassette, ToolDefinition } from "./interceptor.js";

export interface SchemaDiffResult {
  hasBreakingChanges: boolean;
  errors: string[];
  warnings: string[];
}

export function diffCassettes(baseline: Cassette, current: Cassette): SchemaDiffResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const baselineTools = new Map<string, ToolDefinition>(
    baseline.tools.map((t) => [t.name, t])
  );
  const currentTools = new Map<string, ToolDefinition>(
    current.tools.map((t) => [t.name, t])
  );

  // 1. Check for removed tools (Breaking Change)
  for (const [toolName] of baselineTools) {
    if (!currentTools.has(toolName)) {
      errors.push(`[BREAKING] Tool '${toolName}' was deleted from the MCP server.`);
    }
  }

  // 2. Check for added tools (Non-breaking info)
  for (const [toolName] of currentTools) {
    if (!baselineTools.has(toolName)) {
      warnings.push(`[INFO] New tool '${toolName}' discovered.`);
    }
  }

  // 3. Check schema changes on common tools
  for (const [toolName, baseTool] of baselineTools) {
    const currTool = currentTools.get(toolName);
    if (!currTool) continue;

    const baseRequired: string[] = baseTool.inputSchema?.required || [];
    const currRequired: string[] = currTool.inputSchema?.required || [];

    // Check if a new required property was added (Agent won't know to supply it)
    for (const reqProp of currRequired) {
      if (!baseRequired.includes(reqProp)) {
        errors.push(
          `[BREAKING] Tool '${toolName}' added a new required parameter: '${reqProp}'.`
        );
      }
    }

    // Check for parameter type mutations
    const baseProps = baseTool.inputSchema?.properties || {};
    const currProps = currTool.inputSchema?.properties || {};

    for (const [propName, baseSchema] of Object.entries<any>(baseProps)) {
      const currSchema = currProps[propName];
      if (currSchema && baseSchema.type && currSchema.type && baseSchema.type !== currSchema.type) {
        errors.push(
          `[BREAKING] Tool '${toolName}' parameter '${propName}' changed type from '${baseSchema.type}' to '${currSchema.type}'.`
        );
      }
    }
  }

  return {
    hasBreakingChanges: errors.length > 0,
    errors,
    warnings,
  };
}