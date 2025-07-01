import type {
	FetcherHook,
	ModuleExtractorHandler,
	ResolverHook,
	TransformerHook,
} from "./services";

export interface ModpackBootOptions {
	debug?: boolean;
	plugins?: ModpackPlugin[];
}

export interface ModpackPlugin {
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
