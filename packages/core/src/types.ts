import type { FetcherHooks, ResolverHooks, SourcerHooks } from "./services";
import type {
	ModpackPlugin,
	ModpackShimsInit,
	OrchestratorHooks,
} from "./services/types";

export interface ModpackBootOptions
	extends OrchestratorHooks,
		FetcherHooks,
		SourcerHooks,
		ResolverHooks {
	debug?: boolean;
	plugins?: ModpackPlugin[];
}

export interface ModpackInitOptions extends ModpackShimsInit {}

export * from "./services/types";
