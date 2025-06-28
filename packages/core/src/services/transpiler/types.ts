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
