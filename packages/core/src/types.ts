import type {
	FetcherHook,
	ModuleExtractorHandler,
	ResolverHook,
	SourcerHook,
	TransformerHook,
} from "./services";

export interface ModpackBootOptions {
	debug?: boolean;
	plugins?: ModpackPlugin[];
}

export interface ModpackPlugin {
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

export * from "./services/types";
