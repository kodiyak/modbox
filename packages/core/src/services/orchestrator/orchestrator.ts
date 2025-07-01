import type { Bundler, GraphBuilder, VirtualFiles } from "../../services";
import type { Logger } from "../../shared/logger";
import type { OrchestratorMountOptions, OrchestratorOptions } from "./types";

export class Orchestrator {
	private readonly logger: Logger;
	private readonly bundler: Bundler;
	private readonly graph: GraphBuilder;
	public readonly fs: VirtualFiles;

	constructor(
		// @ts-expect-error: This is a placeholder for the options type, which can be defined later.
		options: OrchestratorOptions = {},
		logger: Logger,
		bundler: Bundler,
		graph: GraphBuilder,
		fs: VirtualFiles,
	) {
		this.logger = logger;
		this.bundler = bundler;
		this.graph = graph;
		this.fs = fs;
	}

	async mount(entrypoint: string, options?: OrchestratorMountOptions) {
		this.logger.info("Mounting modules...", this.fs.readdir());
		await this.graph.build();
		const result = await this.bundler.build(entrypoint, options ?? {});
		this.logger.info("Modules mounted successfully");
		this.logger.debug(`Graph`, this.graph.getModules());

		return result;
	}
}
