import type { PluginMiddlewareContext } from "../types";

// Fetcher [Internal]
export type FetcherResult = Promise<Response | undefined>;
export interface FetchMiddlewareProps {
	url: string;
	options: RequestInit | undefined;
	next: (props?: Partial<Omit<FetchMiddlewareProps, "next">>) => FetcherResult;
}
type FetcherMiddleware = (
	props: FetchMiddlewareProps & PluginMiddlewareContext,
) => FetcherResult;
export type FetcherHook = {
	fetch: FetcherMiddleware;
	cleanup?: (url: string) => void;
};

// Resolver [Internal]
export type ResolverResult = string;
export interface ResolveMiddlewareProps {
	path: string;
	parent: string;
	next: (
		props?: Partial<Omit<ResolveMiddlewareProps, "next">>,
	) => ResolverResult;
}
type ResolverMiddleware = (
	props: ResolveMiddlewareProps & PluginMiddlewareContext,
) => ResolverResult;
export type ResolverHook = {
	resolve: ResolverMiddleware;
	cleanup?: (path: string) => void;
};

// Sourcer [Internal]
export interface SourceResult {
	type: string;
	source: string;
}
export interface SourceMiddlewareProps {
	url: string;
	parent: string;
	options: RequestInit | undefined;
	next: (
		props?: Partial<Omit<SourceMiddlewareProps, "next">>,
	) => SourceResult | Promise<SourceResult>;
}
export type SourceMiddleware = (
	props: SourceMiddlewareProps & PluginMiddlewareContext,
) => SourceResult | Promise<SourceResult>;
export type SourcerHook = {
	source: SourceMiddleware;
	cleanup?: (url: string) => void;
};
