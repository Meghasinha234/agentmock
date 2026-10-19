export function diffCassettes(baseline, current) {
    const errors = [];
    const warnings = [];
    const baselineTools = new Map(baseline.tools.map((t) => [t.name, t]));
    const currentTools = new Map(current.tools.map((t) => [t.name, t]));
    // 1. Check for removed tools
    for (const [toolName] of baselineTools) {
        if (!currentTools.has(toolName)) {
            errors.push(`[BREAKING] Tool '${toolName}' was deleted from the MCP server.`);
        }
    }
    // 2. Check for added tools
    for (const [toolName] of currentTools) {
        if (!baselineTools.has(toolName)) {
            warnings.push(`[INFO] New tool '${toolName}' discovered.`);
        }
    }
    // 3. Check parameter regressions
    for (const [toolName, baseTool] of baselineTools) {
        const currTool = currentTools.get(toolName);
        if (!currTool)
            continue;
        const baseRequired = baseTool.inputSchema?.required || [];
        const currRequired = currTool.inputSchema?.required || [];
        for (const reqProp of currRequired) {
            if (!baseRequired.includes(reqProp)) {
                errors.push(`[BREAKING] Tool '${toolName}' added a new required parameter: '${reqProp}'.`);
            }
        }
        const baseProps = baseTool.inputSchema?.properties || {};
        const currProps = currTool.inputSchema?.properties || {};
        for (const [propName, baseSchema] of Object.entries(baseProps)) {
            const currSchema = currProps[propName];
            if (currSchema && baseSchema.type && currSchema.type && baseSchema.type !== currSchema.type) {
                errors.push(`[BREAKING] Tool '${toolName}' parameter '${propName}' changed type from '${baseSchema.type}' to '${currSchema.type}'.`);
            }
        }
    }
    return {
        hasBreakingChanges: errors.length > 0,
        errors,
        warnings,
    };
}
//# sourceMappingURL=diff.js.map