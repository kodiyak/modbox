import {
	BlobsRegistry,
	Bundler,
	ExternalRegistry,
	GraphBuilder,
	ModulesExtractor,
	ModulesRegistry,
	Orchestrator,
	PolyfillFetcher,
	PolyfillResolver,
	PolyfillTransformer,
	ResponseRegistry,
	VirtualFiles,
} from "./services";
import { BundlerRegistry } from "./services/bundler/bundler-registry";
import { Logger } from "./shared";
import type { ModpackBootOptions } from "./types";

export class Modpack {
	static async boot({ debug, plugins = [] }: ModpackBootOptions) {
		if (debug) Logger.enable("*");
		const fs = new VirtualFiles();
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
			plugins.map((plugin) => plugin.pipeline?.fetcher!).filter(Boolean),
		);
		const transformer = new PolyfillTransformer(
			Logger.create("modules-transformer"),
			registry,
			fs,
			plugins.map((plugin) => plugin.pipeline?.transformer!).filter(Boolean),
		);
		const resolver = new PolyfillResolver(
			Logger.create("modules-resolver"),
			registry,
			fs,
			plugins.map((plugin) => plugin.pipeline?.resolver!).filter(Boolean),
		);
		const bundler = new Bundler(
			Logger.create("bundler"),
			registry,
			fetcher,
			resolver,
			transformer,
		);
		/** @todo: refactor options */
		const graphBuilder = new GraphBuilder(
			Logger.create("graph-builder"),
			fs,
			extractor,
			{},
		);

		return new Orchestrator(
			{ debug },
			Logger.create("orchestrator"),
			bundler,
			graphBuilder,
			fs,
		);
	}
}
