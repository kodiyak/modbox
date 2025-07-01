import type {
	FetcherHook,
	ModuleExtractorHandler,
	ResolverHook,
	TransformerHook,
} from "./services";

export interface ModboxBootOptions {
	debug?: boolean;
	plugins?: ModboxPlugin[];
}

export interface ModboxPlugin {
	pipeline?: {
		resolver?: ResolverHook;
		fetcher?: FetcherHook;
		transformer?: TransformerHook;
	};
	analyze?: {
		process?: ModuleExtractorHandler;
	};
}

export * from "./services/types";
