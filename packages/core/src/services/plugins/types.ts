import type {
	FetcherHook,
	ResolverHook,
	SourcerHook,
	TransformerHook,
} from "../bundler";
import type { ModuleExtractorHandler } from "../graph";
import type { OnMountHook } from "../orchestrator";

export interface ModpackPlugin {
	name: string;
	onMount?: OnMountHook;
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
