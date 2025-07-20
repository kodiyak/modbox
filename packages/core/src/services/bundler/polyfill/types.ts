import type { Logger } from "../../../shared";
import type { IPluginReporter } from "../../plugins";
import type { VirtualFiles } from "../../types";
import type { PluginMiddlewareContext } from "../types";

// Fetcher [Internal]
export type FetcherResult = Promise<Response | undefined>;
export interface FetchMiddlewareProps {
	url: string;
	options: RequestInit | undefined;
	reporter: IPluginReporter;
	next: (props?: Partial<Omit<FetchMiddlewareProps, "next">>) => FetcherResult;
}
type FetcherMiddleware = (
	props: FetchMiddlewareProps & PluginMiddlewareContext,
) => FetcherResult;
export type FetcherHook = {
	fetch: FetcherMiddleware;
	cleanup?: (url: string) => void;
};
export type OnFetchStartHook = (props: {
	url: string;
	options?: RequestInit;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export type OnFetchEndHook = (props: {
	url: string;
	options?: RequestInit;
	response: Response | undefined;
	error: Error | null;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export interface FetcherHooks {
	onFetchStart?: OnFetchStartHook;
	onFetchEnd?: OnFetchEndHook;
}

// Resolver [Internal]
export type ResolverResult = string | undefined;
export interface ResolveMiddlewareProps {
	path: string;
	parent: string;
	reporter: IPluginReporter;
	next: (
		props?: Partial<Omit<ResolveMiddlewareProps, "next">>,
	) => ResolverResult;
}
type ResolverMiddleware = (
	props: ResolveMiddlewareProps & PluginMiddlewareContext,
) => ResolverResult;
export type ResolverHook = {
	fallback?: boolean;
	resolve: ResolverMiddleware;
	cleanup?: (path: string) => void;
};
export type OnResolveStartHook = (props: {
	path: string;
	parent: string;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export type OnResolveEndHook = (props: {
	path: string;
	parent: string;
	result: ResolverResult | undefined;
	error: Error | null;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export interface ResolverHooks {
	onResolveStart?: OnResolveStartHook;
	onResolveEnd?: OnResolveEndHook;
}

// Sourcer [Internal]
export type SourceResult =
	| {
			options: RequestInit | undefined;
			url: string;
			parent: string;
	  }
	| undefined;
export interface SourceMiddlewareProps {
	url: string;
	parent: string;
	options: RequestInit | undefined;
	reporter: IPluginReporter;
	next: (
		props?: Partial<Omit<SourceMiddlewareProps, "next" | "reporter">>,
	) => SourceResult | Promise<SourceResult>;
}
export type SourceMiddleware = (
	props: SourceMiddlewareProps & PluginMiddlewareContext,
) => SourceResult | Promise<SourceResult>;
export type SourcerHook = {
	source: SourceMiddleware;
	cleanup?: (url: string) => void;
};
export type OnSourceStartHook = (props: {
	url: string;
	parent: string;
	options?: RequestInit;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export type OnSourceEndHook = (props: {
	url: string;
	parent: string;
	options?: RequestInit;
	result: SourceResult | undefined;
	error: Error | null;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export interface SourcerHooks {
	onSourceStart?: OnSourceStartHook;
	onSourceEnd?: OnSourceEndHook;
}
