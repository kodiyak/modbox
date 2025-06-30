import type { FetcherHook, ResolverHook } from "./services";

export interface ModboxBootOptions {
	debug?: boolean;
	plugins?: ModboxPlugin[];
}

export interface ModboxPlugin {
	resolver?: ResolverHook;
	fetcher?: FetcherHook;
}
