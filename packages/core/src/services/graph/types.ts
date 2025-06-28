export interface GraphModuleProps {
	path: string;
	originalPath: string;
	runtime?: string;
	dependencies: Record<string, string[]>;
	exported: string[];
	usedBy: string[];
	uses: string[];
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

export interface ModuleAnalysisResult {
	dependencies: Record<string, string[]>;
	exported: string[];
	warnings?: string[];
}

export interface ExtractedDependency {
	path: string;
	names: string[];
	type: "dependencies" | "exported";
	name?: string;
}
