import type { Logger } from "../../shared";
import type { VirtualFiles } from "../../shared/virtual-files";
import type { GraphBuilderOptions } from "../graph";
import type { BundlerRegistry } from "./bundler-registry";

// Resolver [Internal]
export type ResolverResult = string;
export interface ResolveMiddlewareProps {
	path: string;
	parent: string;
	next: (
		props?: Partial<Omit<ResolveMiddlewareProps, "next">>,
	) => ResolverResult;
}
interface ResolveMiddlewareContext {
	logger: Logger;
	registry: BundlerRegistry;
	fs: VirtualFiles;
}
type ResolverMiddleware = (
	props: ResolveMiddlewareProps & ResolveMiddlewareContext,
) => ResolverResult;
export type ResolverHook = {
	resolve: ResolverMiddleware;
	cleanup?: (path: string) => void;
};

// Bundler [Internal]
export interface BundlerBuildOptions extends GraphBuilderOptions {
	inject?: Record<string, any>;
}

// Fetcher [Internal]
export type FetcherResult = Promise<Response | undefined>;
interface FetcherMiddlewareContext {
	logger: Logger;
	registry: BundlerRegistry;
	fs: VirtualFiles;
}
interface FetchMiddlewareProps {
	url: string;
	options: RequestInit | undefined;
	next: () => FetcherResult;
}
type FetcherMiddleware = (
	props: FetchMiddlewareProps & FetcherMiddlewareContext,
) => FetcherResult;
export type FetcherHook = {
	fetch: FetcherMiddleware;
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
}
