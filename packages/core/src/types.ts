import type {
	FetcherHook,
	ModuleExtractorHandler,
	ResolverHook,
} from "./services";

export interface ModboxBootOptions {
	debug?: boolean;
	plugins?: ModboxPlugin[];
}

export interface ModboxPlugin {
	pipeline?: {
		resolver?: ResolverHook;
		fetcher?: FetcherHook;
	};
	analyze?: {
		process?: ModuleExtractorHandler;
	};
}

export * from "./services/types";
