import {
	BlobsRegistry,
	Bundler,
	BundlerRegistry,
	ExternalRegistry,
	getPluginLogger,
	getPluginReporter,
	ModpackShims,
	ModulesExtractor,
	ModulesRegistry,
	Orchestrator,
	PolyfillFetcher,
	PolyfillResolver,
	PolyfillSourcer,
	ResponseRegistry,
	VirtualFiles,
} from "./services";
import { Logger } from "./shared";
import type { ModpackBootOptions, ModpackInitOptions } from "./types";
import { getModpackPlugin } from "./utils";

export class Modpack {
	static async init(options: ModpackInitOptions) {
		await ModpackShims.init({
			...options,
		});
	}

	static async boot({ debug, plugins = [], ...rest }: ModpackBootOptions) {
		if (debug) Logger.enable("*");
		const fs = VirtualFiles.getInstance(Logger.create("virtual-files"));
		plugins.push(getModpackPlugin(rest));
		const extractor = new ModulesExtractor(
			Logger.create("modules-extractor"),
			plugins.map((plugin) => plugin.analyze?.process!).filter(Boolean),
		);
		await extractor.preload();
		const registry = BundlerRegistry.create({
			blobs: new BlobsRegistry(Logger.create("blobs-registry")),
			responses: new ResponseRegistry(Logger.create("responses-registry")),
			modules: new ModulesRegistry(Logger.create("modules-registry")),
			external: new ExternalRegistry(Logger.create("external-registry")),
		});
		const fetcher = new PolyfillFetcher(
			Logger.create("modules-fetcher"),
			registry,
			fs,
			plugins
				.filter((plugin) => plugin.pipeline?.fetcher)
				.map((plugin) => ({
					name: plugin.name,
					...plugin.pipeline?.fetcher!,
				})),
			{
				onFetchStart: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin.onFetchStart?.({
								...props,
								logger: getPluginLogger(plugin.name),
								reporter: getPluginReporter(plugin.name),
							}),
						),
					);
				},
			},
		);
		const sourcer = new PolyfillSourcer(
			Logger.create("modules-sourcer"),
			registry,
			fs,
			plugins
				.filter((plugin) => plugin.pipeline?.sourcer)
				.map((plugin) => ({
					name: plugin.name,
					...plugin.pipeline?.sourcer!,
				})),
			{
				onSourceStart: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin.onSourceStart?.({
								...props,
								logger: getPluginLogger(plugin.name),
								reporter: getPluginReporter(plugin.name),
							}),
						),
					);
				},
				onSourceEnd: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin.onSourceEnd?.({
								...props,
								logger: getPluginLogger(plugin.name),
								reporter: getPluginReporter(plugin.name),
							}),
						),
					);
				},
			},
		);
		const resolver = new PolyfillResolver(
			Logger.create("modules-resolver"),
			registry,
			fs,
			plugins
				.filter((plugin) => plugin.pipeline?.resolver)
				.map((plugin) => ({
					name: plugin.name,
					...plugin.pipeline?.resolver!,
				})),
			{
				onResolveStart: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin.onResolveStart?.({
								...props,
								logger: getPluginLogger(plugin.name),
								reporter: getPluginReporter(plugin.name),
							}),
						),
					);
				},
				onResolveEnd: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin.onResolveEnd?.({
								...props,
								logger: getPluginLogger(plugin.name),
								reporter: getPluginReporter(plugin.name),
							}),
						),
					);
				},
			},
		);
		const bundler = new Bundler(
			Logger.create("bundler"),
			registry,
			fetcher,
			resolver,
			sourcer,
		);

		const orchestrator = new Orchestrator(
			{
				debug,
				onBuildStart: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin?.onBuildStart?.({
								...props,
								logger: getPluginLogger(plugin.name),
								reporter: getPluginReporter(plugin.name),
							}),
						),
					);
				},
				onBuildEnd: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin?.onBuildEnd?.({
								...props,
								logger: getPluginLogger(plugin.name),
								reporter: getPluginReporter(plugin.name),
							}),
						),
					);
				},
				onModuleUpdate: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin?.onModuleUpdate?.({
								...props,
								logger: getPluginLogger(plugin.name),
								reporter: getPluginReporter(plugin.name),
							}),
						),
					);
				},
				onLog: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin?.onLog?.({
								...props,
								logger: getPluginLogger(plugin.name),
								reporter: getPluginReporter(plugin.name),
							}),
						),
					);
				},
			},
			Logger.create("orchestrator"),
			bundler,
			fs,
		);

		await Promise.all(
			// Bootstrap plugins
			plugins.map(async (plugin) => orchestrator.addPlugin(plugin)),
		);

		ModpackShims.getInstance().addOrchestrator(orchestrator);

		return orchestrator;
	}
}
