import { z } from "zod";
export declare const ToolDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    inputSchema: z.ZodObject<{
        type: z.ZodString;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        properties?: Record<string, any> | undefined;
        required?: string[] | undefined;
    }, {
        type: string;
        properties?: Record<string, any> | undefined;
        required?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    inputSchema: {
        type: string;
        properties?: Record<string, any> | undefined;
        required?: string[] | undefined;
    };
    description?: string | undefined;
}, {
    name: string;
    inputSchema: {
        type: string;
        properties?: Record<string, any> | undefined;
        required?: string[] | undefined;
    };
    description?: string | undefined;
}>;
export declare const CassetteSchema: z.ZodObject<{
    version: z.ZodString;
    recordedAt: z.ZodString;
    serverCommand: z.ZodString;
    serverArgs: z.ZodArray<z.ZodString, "many">;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        inputSchema: z.ZodObject<{
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            properties?: Record<string, any> | undefined;
            required?: string[] | undefined;
        }, {
            type: string;
            properties?: Record<string, any> | undefined;
            required?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        inputSchema: {
            type: string;
            properties?: Record<string, any> | undefined;
            required?: string[] | undefined;
        };
        description?: string | undefined;
    }, {
        name: string;
        inputSchema: {
            type: string;
            properties?: Record<string, any> | undefined;
            required?: string[] | undefined;
        };
        description?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    version: string;
    recordedAt: string;
    serverCommand: string;
    serverArgs: string[];
    tools: {
        name: string;
        inputSchema: {
            type: string;
            properties?: Record<string, any> | undefined;
            required?: string[] | undefined;
        };
        description?: string | undefined;
    }[];
}, {
    version: string;
    recordedAt: string;
    serverCommand: string;
    serverArgs: string[];
    tools: {
        name: string;
        inputSchema: {
            type: string;
            properties?: Record<string, any> | undefined;
            required?: string[] | undefined;
        };
        description?: string | undefined;
    }[];
}>;
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
export type Cassette = z.infer<typeof CassetteSchema>;
//# sourceMappingURL=cassette.d.ts.map