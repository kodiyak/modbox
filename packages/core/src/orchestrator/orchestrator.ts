import type { Bundler, GraphBuilder, VirtualFiles } from "../services";
import { Logger } from "../shared/logger";
import type { OrchestratorOptions } from "./types";

export class Orchestrator {
	private readonly logger: Logger;
	private readonly bundler: Bundler;
	private readonly graph: GraphBuilder;
	public readonly fs: VirtualFiles;

	constructor(
		options: OrchestratorOptions = {},
		bundler: Bundler,
		graph: GraphBuilder,
		fs: VirtualFiles,
	) {
		this.logger = new Logger(options.debug ? "debug" : "none");
		this.bundler = bundler;
		this.graph = graph;
		this.fs = fs;
	}

	async mount() {
		this.logger.info("[Orchestrator] Mounting modules...");
		await this.graph.build();
		await this.bundler.build();
		this.logger.info("[Orchestrator] Modules mounted successfully");
		this.logger.debug(`[Orchestrator] Virtual Files`, this.fs.readdir());
		this.logger.debug(`[Orchestrator] Graph`, this.graph.getModules());
	}
}
