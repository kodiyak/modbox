import type { Bundler, VirtualFiles } from "../../services";
import type { Logger } from "../../shared/logger";
import type {
	OrchestratorHooks,
	OrchestratorMountOptions,
	OrchestratorOptions,
} from "./types";

export class Orchestrator {
	private readonly logger: Logger;
	private readonly bundler: Bundler;
	public readonly fs: VirtualFiles;
	private readonly hooks: OrchestratorHooks;

	constructor(
		options: OrchestratorOptions & OrchestratorHooks = {},
		logger: Logger,
		bundler: Bundler,
		fs: VirtualFiles,
	) {
		this.logger = logger;
		this.bundler = bundler;
		this.fs = fs;

		const { onMount } = options;
		this.hooks = { onMount };

		this.fs.events.on("file:updated", async (data) => {
			// HMR - Refresh the module in the bundler
			try {
				const { module: result, updated } = await this.bundler.refresh(
					`file://${data.path}`,
				);

				this.hooks.onModuleUpdate?.({
					result: module,
					error: null,
					updated,
					fs: this.fs,
					logger: this.logger,
					path: data.path,
					content: data.content,
				});
			} catch (error) {}
		});
	}

	async mount(entrypoint: string, options?: OrchestratorMountOptions) {
		try {
			const result = await this.bundler.build(entrypoint, options ?? {});
			await this.hooks.onMount?.({
				entrypoint,
				options,
				result,
				error: null,
				fs: this.fs,
				logger: this.logger,
			});
		} catch (error) {
			this.logger.error("Failed to mount entrypoint:", error);
			await this.hooks.onMount?.({
				entrypoint,
				options,
				error: error as Error,
				result: undefined,
				fs: this.fs,
				logger: this.logger,
			});
		}
	}
}
