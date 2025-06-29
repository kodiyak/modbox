import type {
	GraphBuilder,
	PolyfillFetcher,
	PolyfillResolver,
} from "../services";
import { Logger } from "../shared/logger";
import type { OrchestratorOptions } from "./types";

export class Orchestrator {
	public readonly logger: Logger;
	public readonly fetcher: PolyfillFetcher;
	public readonly resolver: PolyfillResolver;
	public readonly graph: GraphBuilder;

	constructor(
		options: OrchestratorOptions = {},
		fetcher: PolyfillFetcher,
		resolver: PolyfillResolver,
		graph: GraphBuilder,
	) {
		this.logger = new Logger(options.debug ? "debug" : "none");
		this.fetcher = fetcher;
		this.resolver = resolver;
		this.graph = graph;
	}
}
