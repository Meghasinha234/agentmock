import type { Cassette } from "./cassette.js";
export interface SchemaDiffResult {
    hasBreakingChanges: boolean;
    errors: string[];
    warnings: string[];
}
export declare function diffCassettes(baseline: Cassette, current: Cassette): SchemaDiffResult;
//# sourceMappingURL=diff.d.ts.map