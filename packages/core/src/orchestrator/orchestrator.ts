import type {
	GraphBuilder,
	PolyfillFetcher,
	PolyfillResolver,
	VirtualFiles,
} from "../services";
import { Logger } from "../shared/logger";
import type { OrchestratorOptions } from "./types";

export class Orchestrator {
	public readonly logger: Logger;
	public readonly fetcher: PolyfillFetcher;
	public readonly resolver: PolyfillResolver;
	public readonly graph: GraphBuilder;
	public readonly fs: VirtualFiles;

	constructor(
		options: OrchestratorOptions = {},
		fetcher: PolyfillFetcher,
		resolver: PolyfillResolver,
		graph: GraphBuilder,
		fs: VirtualFiles,
	) {
		this.logger = new Logger(options.debug ? "debug" : "none");
		this.fetcher = fetcher;
		this.resolver = resolver;
		this.graph = graph;
		this.fs = fs;
	}

	async mount() {
		this.logger.info("Mounting orchestrator...");
		this.graph.build();
		this.logger.info("Orchestrator mounted successfully.");
	}
}
