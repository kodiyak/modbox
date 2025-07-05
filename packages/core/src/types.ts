import type { FetcherHooks, ResolverHooks, SourcerHooks } from "./services";
import type { ModpackPlugin, OrchestratorHooks } from "./services/types";

export interface ModpackBootOptions
	extends OrchestratorHooks,
		FetcherHooks,
		SourcerHooks,
		ResolverHooks {
	debug?: boolean;
	plugins?: ModpackPlugin[];
}

export * from "./services/types";
