import {
	BlobsRegistry,
	Bundler,
	ExternalRegistry,
	ModulesExtractor,
	ModulesRegistry,
	Orchestrator,
	PolyfillFetcher,
	PolyfillResolver,
	PolyfillSourcer,
	ResponseRegistry,
	VirtualFiles,
} from "./services";
import { BundlerRegistry } from "./services/bundler/bundler-registry";
import { Logger } from "./shared";
import type { ModpackBootOptions } from "./types";

export class Modpack {
	static async boot({ debug, plugins = [] }: ModpackBootOptions) {
		if (debug) Logger.enable("*");
		const fs = new VirtualFiles(Logger.create("virtual-files"));
		console.log("Booting Modpack...");
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
								logger: props.logger.namespace(plugin.name),
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
								logger: props.logger.namespace(plugin.name),
							}),
						),
					);
				},
				onSourceEnd: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin.onSourceEnd?.({
								...props,
								logger: props.logger.namespace(plugin.name),
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
								logger: props.logger.namespace(plugin.name),
							}),
						),
					);
				},
				onResolveEnd: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin.onResolveEnd?.({
								...props,
								logger: props.logger.namespace(plugin.name),
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

		return new Orchestrator(
			{
				debug,
				onBuildStart: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin?.onBuildStart?.({
								...props,
								logger: props.logger.namespace(plugin.name),
							}),
						),
					);
				},
				onBuildEnd: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin?.onBuildEnd?.({
								...props,
								logger: props.logger.namespace(plugin.name),
							}),
						),
					);
				},
				onModuleUpdate: async (props) => {
					await Promise.all(
						plugins.map(async (plugin) =>
							plugin?.onModuleUpdate?.({
								...props,
								logger: props.logger.namespace(plugin.name),
							}),
						),
					);
				},
			},
			Logger.create("orchestrator"),
			bundler,
			fs,
		);
	}
}
