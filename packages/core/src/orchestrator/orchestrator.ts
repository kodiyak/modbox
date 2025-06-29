import type { GraphBuilder, PolyfillModules, VirtualFiles } from "../services";
import { Logger } from "../shared/logger";
import type { OrchestratorOptions } from "./types";

export class Orchestrator {
	private readonly logger: Logger;
	private readonly polyfill: PolyfillModules;
	private readonly graph: GraphBuilder;
	public readonly fs: VirtualFiles;

	constructor(
		options: OrchestratorOptions = {},
		polyfill: PolyfillModules,
		graph: GraphBuilder,
		fs: VirtualFiles,
	) {
		this.logger = new Logger(options.debug ? "debug" : "none");
		this.polyfill = polyfill;
		this.graph = graph;
		this.fs = fs;
	}

	async mount() {
		this.logger.info("[Orchestrator] Mounting modules...");
		await this.graph.build();
		await this.polyfill.build();
		this.logger.info("[Orchestrator] Modules mounted successfully");
	}
}
