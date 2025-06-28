export type ResolverResult = string | Promise<string>;
type ResolverMiddleware = (
	path: string,
	parent: string,
	next: () => ResolverResult,
) => ResolverResult;
export type ResolverHook = {
	resolve: ResolverMiddleware;
	cleanup?: (path: string) => void;
};

export type FetcherResult = Promise<Response | undefined>;
type FetcherMiddleware = (
	url: string,
	options: RequestInit | undefined,
	next: () => FetcherResult,
) => FetcherResult;
export type FetcherHook = {
	fetch: FetcherMiddleware;
	cleanup?: (url: string) => void;
};

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
