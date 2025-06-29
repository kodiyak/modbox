import type { FetcherHook, ResolverHook } from "./services";
import type { GraphBuilderOptions } from "./services/graph/types";
import type { Logger } from "./shared";

export interface ModboxBootOptions {
	debug?: boolean;
	logger?: Logger;
	fetchers?: FetcherHook[];
	resolvers?: ResolverHook[];
	graphOptions?: GraphBuilderOptions;
}
