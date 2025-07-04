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

		const { debug: _, ...hooks } = options;
		this.hooks = hooks;

		this.fs.events.on("file:updated", async (data) => {
			// HMR - Refresh the module in the bundler
			let updated = false;
			let result: any;
			let error: Error | null = null;
			try {
				const { module, updated: hotReloaded } = await this.bundler.refresh(
					`file://${data.path}`,
				);
				result = module;
				updated = hotReloaded;
			} catch (err) {
				this.logger.error("Failed to refresh module:", err);
				error = err as Error;
			}

			await this.hooks.onModuleUpdate?.({
				result,
				error,
				updated,
				fs: this.fs,
				logger: this.logger,
				path: data.path,
				content: data.content,
			});
		});
	}

	async mount(entrypoint: string, options?: OrchestratorMountOptions) {
		let error: Error | null = null;
		let result: any;
		await this.hooks.onBuildStart?.({
			entrypoint,
			options,
			fs: this.fs,
			logger: this.logger,
		});

		try {
			result = await this.bundler.build(entrypoint, options ?? {});
		} catch (err) {
			this.logger.error("Failed to mount entrypoint:", err);
			error = err as Error;
		}
		await this.hooks.onBuildEnd?.({
			entrypoint,
			options,
			error,
			result,
			fs: this.fs,
			logger: this.logger,
		});
	}
}
