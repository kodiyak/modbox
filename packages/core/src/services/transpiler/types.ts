export type ModuleKind =
	| "typescript"
	| "tsx"
	| "javascript"
	| "jsx"
	| "json"
	| "css"
	| "binary";

export type TranspilerFunction = (
	code: string,
	filePath: string,
	options?: any,
) => Promise<{ code: string; map?: string }>;

export type TranspilerMap = Record<ModuleKind, TranspilerFunction | undefined>;

export interface TranspileCodeResult {
	code: string;
	kind: ModuleKind;
	map?: any;
}

export interface TranspileResult {
	codes: Record<string, TranspileCodeResult>;
	warnings: string[];
}
