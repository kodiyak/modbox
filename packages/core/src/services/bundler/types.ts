import type { Logger } from "../../shared";
import type { VirtualFiles } from "../../shared/virtual-files";
import type { GraphBuilderOptions } from "../graph";
import type { BundlerRegistry } from "./bundler-registry";

// Plugin [Internal]
export interface PluginMiddlewareContext {
	logger: Logger;
	registry: BundlerRegistry;
	fs: VirtualFiles;
}

// Bundler [Internal]
export interface BundlerBuildOptions extends GraphBuilderOptions {
	inject?: Record<string, any>;
}

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
