import type { FetcherHook, ResolverHook } from "./services";
import type { Logger } from "./shared";

export interface ModboxBootOptions {
	debug?: boolean;
	logger?: Logger;
	fetchers?: FetcherHook[];
	resolvers?: ResolverHook[];
}
