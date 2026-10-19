import { z } from "zod";
export const ToolDefinitionSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    inputSchema: z.object({
        type: z.string(),
        properties: z.record(z.any()).optional(),
        required: z.array(z.string()).optional(),
    }),
});
export const CassetteSchema = z.object({
    version: z.string(),
    recordedAt: z.string(),
    serverCommand: z.string(),
    serverArgs: z.array(z.string()),
    tools: z.array(ToolDefinitionSchema),
});
//# sourceMappingURL=cassette.js.map