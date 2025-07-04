import type {
	FetcherHook,
	ResolverHook,
	SourcerHook,
	TransformerHook,
} from "../bundler";
import type { ModuleExtractorHandler } from "../graph";
import type { OrchestratorHooks } from "../orchestrator";

export interface ModpackPlugin extends OrchestratorHooks {
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
