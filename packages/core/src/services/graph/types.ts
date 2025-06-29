import type { Module, ModuleItem, Script } from "@swc/wasm";

export interface GraphModuleProps {
	path: string;
	originalPath: string;
	runtime?: string;
	dependencies: ExtractedGraphModule[];
	exported: string[];
}

export interface GraphBuilderOptions {
	basePath?: string;
	aliasMap?: Record<string, string>;
	includeExternalDependencies?: boolean;
	maxDepth?: number;
}

export interface GraphParserOptions {
	path: string;
	content: string;
}
export interface GraphDependency {
	type: "dependencies";
	names: string[];
	path: string;
}
export interface GraphExported {
	type: "exported";
	name: string;
}
export type ExtractedGraphModule = GraphDependency | GraphExported;
export interface ModuleExtractorTools {
	isType: <T extends ModuleItem["type"]>(
		node: any,
		type: T,
	) => node is Extract<ModuleItem, { type: T }>;
}
export interface ModuleExtractorHandlerResult {
	dependencies: GraphDependency[];
	exported: GraphExported[];
	warnings?: string[];
}
export type ModuleExtractorHandler = (
	data: { node: ModuleItem; dir: string; path: string },
	tools: ModuleExtractorTools,
) => ModuleExtractorHandlerResult;

export interface ModuleAnalysisResult {
	dependencies: Record<string, string[]>;
	exported: string[];
	warnings?: string[];
}

export type SWCModule = Script | Module;

// export interface ExtractedDependency {
// 	path: string;
// 	names: string[];
// 	type: "dependencies" | "exported";
// 	name?: string;
// }
