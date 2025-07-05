import type { Bundler, VirtualFiles } from "../../services";
import type { Logger } from "../../shared/logger";
import {
	getPluginLogger,
	getPluginReporter,
	type ModpackPlugin,
	PluginReporter,
} from "../plugins";
import type {
	OrchestratorHooks,
	OrchestratorMountOptions,
	OrchestratorOptions,
} from "./types";

export class Orchestrator {
	private readonly logger: Logger;
	private readonly reporter: PluginReporter;
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
		this.reporter = PluginReporter.create("orchestrator");

		const { debug: _, ...hooks } = options;
		this.hooks = hooks;

		this.fs.events.on("file:updated", async (data) => {
			await this.refresh(data.path, data.content);
		});
	}

	async mount(entrypoint: string, options?: OrchestratorMountOptions) {
		let error: Error | null = null;
		let result: any;
		await this.hooks.onBuildStart?.({
			entrypoint,
			options,
			fs: this.fs,
			// placeholder for plugin reporter and logger
			logger: this.logger,
			reporter: this.reporter,
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
			// placeholder for plugin reporter and logger
			logger: this.logger,
			reporter: this.reporter,
		});
	}

	async refresh(path: string, content: string) {
		// HMR - Refresh the module in the bundler
		let updated = false;
		let result: any;
		let error: Error | null = null;
		try {
			const { module, updated: hotReloaded } = await this.bundler.refresh(
				`file://${path}`,
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
			path: path,
			content: content,
			// placeholder for plugin reporter and logger
			reporter: this.reporter,
			logger: this.logger,
		});
	}

	async addPlugin(plugin: ModpackPlugin) {
		const reporter = getPluginReporter(plugin.name);
		const logger = getPluginLogger(plugin.name);
		reporter.getEventEmitter().on("plugin:log", async (data) => {
			await this.hooks.onLog?.({
				message: data.message,
				level: data.level,
				fs: this.fs,
				logger,
				reporter,
			});
		});

		await plugin.onBoot?.({
			fs: this.fs,
			logger,
			reporter,
		});
	}
}
