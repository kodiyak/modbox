import type { Logger } from "../../shared";
import type { VirtualFiles } from "../../shared/virtual-files";
import type { GraphBuilderOptions } from "../graph";
import type { BundlerRegistry } from "./bundler-registry";

// Plugin [Internal]
interface PluginMiddlewareContext {
	logger: Logger;
	registry: BundlerRegistry;
	fs: VirtualFiles;
}

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

// Bundler [Internal]
export interface BundlerBuildOptions extends GraphBuilderOptions {
	inject?: Record<string, any>;
}

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

export interface TransformMiddlewareProps {
	source: string;
	url: string;
	next: (
		props?: Partial<Omit<TransformMiddlewareProps, "next">>,
	) => string | Promise<string>;
}
export type TransformMiddleware = (
	props: TransformMiddlewareProps & PluginMiddlewareContext,
) => string | Promise<string>;
export type TransformerHook = {
	transform: TransformMiddleware;
	cleanup?: (url: string) => void;
};

// Polyfill [Internal]
export interface PolyfillInitOptions {
	esmsInitOptions: EsmsInitOptions;
}

// Graph [Internal]
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

// Shims
export interface ImportMap {
	imports?: { [key: string]: string };
	scopes?: { [key: string]: { [key: string]: string } };
}

type EsmsResolve = (
	specifier: string,
	parentUrl: string,
	resolve: Omit<EsmsResolve, "resolve">,
) => Promise<string | null>;
type EsmsFetch = (
	url: string,
	options: RequestInit,
) => Promise<Response | null>;
type EsmsSource = {
	type: "js" | "css" | "json";
	source: string;
};
type EsmsSourceHook = (
	url: string,
	options: RequestInit,
	parentUrl: string,
	defaultSourceHook: (url: string, options: RequestInit) => EsmsSource,
) => EsmsSource | Promise<EsmsSource>;
export interface EsmsInitOptions {
	shimMode?: boolean;
	version?: string;
	hotReload?: boolean;
	hotReloadInterval?: number;
	polyfillEnable?: string[];
	polyfillDisable?: string[];
	nonce?: string;
	noLoadEventRetriggers?: boolean;
	skip?: RegExp | null;
	enforceIntegrity?: boolean;
	mapOverrides?: boolean;
	nativePassthrough?: boolean;
	resolve?: EsmsResolve;
	fetch?: EsmsFetch;
	onerror?: (e: Error) => void;
	onpolyfill?: () => void;
	source?: EsmsSourceHook;
	meta?: (meta: Record<string, any>, url: string) => void;
	onimport?: (
		url: string,
		options: RequestInit | undefined,
		parentUrl: string,
		source: EsmsSource,
	) => void;
}

export interface IImportShim {
	addImportMap(map: ImportMap): void;
	importShim(specifier: string): Promise<any>;
	hotReload(url: string): Promise<boolean>;
}
