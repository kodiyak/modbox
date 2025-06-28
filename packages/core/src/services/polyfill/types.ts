export type PolyfillDefaultResolver = (path: string, parent: string) => string;
export type PolyfillDefaultFetcher = (
	url: string,
	options?: RequestInit,
) => Promise<Response>;

export interface ModuleGraph {
	dependencies: Record<string, string[]>;
	exported: string[];
	used: string[];
	by: string[];
	originalPath: string;
	path: string;
	type: string;
	runtime?: string;
}
