import type { FetcherHook, ResolverHook } from "./services";

export interface ModboxBootOptions {
	debug?: boolean;
	fetchers?: FetcherHook[];
	resolvers?: ResolverHook[];
}

export interface ModboxPlugin {
	resolver?: ResolverHook;
	fetcher?: FetcherHook;
}
