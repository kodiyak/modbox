import type {
	FetcherHook,
	FetcherHooks,
	ResolverHook,
	ResolverHooks,
	SourcerHook,
	SourcerHooks,
	TransformerHook,
} from "../bundler";
import type { ModuleExtractorHandler } from "../graph";
import type { OrchestratorHooks } from "../orchestrator";

export interface ModpackPlugin
	extends OrchestratorHooks,
		FetcherHooks,
		SourcerHooks,
		ResolverHooks {
	name: string;
	pipeline?: {
		resolver?: ResolverHook;
		fetcher?: FetcherHook;
		transformer?: TransformerHook;
		sourcer?: SourcerHook;
	};
	analyze?: {
		process?: ModuleExtractorHandler;
	};
}
