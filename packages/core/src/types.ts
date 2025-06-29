import type { FetcherHook, ResolverHook } from "./services";

export interface ModboxBootOptions {
	debug?: boolean;
	fetchers?: FetcherHook[];
	resolvers?: ResolverHook[];
}
