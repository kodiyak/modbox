import {
	BlobsRegistry,
	Bundler,
	createBlobResolver,
	createDefaultExportsExtractor,
	createDefaultFetcher,
	createDefaultImportsExtractor,
	createGraphResolver,
	createLoggerExtractor,
	createMemoryResolver,
	createVirtualResolver,
	ExternalRegistry,
	GraphBuilder,
	GraphRegistry,
	ModulesExtractor,
	ModulesRegistry,
	Orchestrator,
	PolyfillFetcher,
	PolyfillResolver,
	TranspileHandlers,
	Transpiler,
	VirtualFiles,
} from "./services";
import { BundlerRegistry } from "./services/bundler/bundler-registry";
import { Logger } from "./shared";
import type { ModboxBootOptions } from "./types";

export class Modbox {
	static async boot({
		debug,
		fetchers = [],
		resolvers = [],
	}: ModboxBootOptions) {
		if (debug) Logger.enable("*");
		const fs = new VirtualFiles();
		const extractor = new ModulesExtractor(Logger.create("modules-extractor"), [
			createDefaultExportsExtractor(),
			createDefaultImportsExtractor(),
			createLoggerExtractor(),
		]);
		await extractor.preload();
		const registry = BundlerRegistry.create({
			blobs: new BlobsRegistry(Logger.create("blobs-registry")),
			graph: new GraphRegistry(Logger.create("graph-registry")),
			modules: new ModulesRegistry(Logger.create("modules-registry")),
			external: new ExternalRegistry(Logger.create("external-registry")),
		});
		const fetcher = new PolyfillFetcher(
			Logger.create("modules-fetcher"),
			registry,
			fs,
			[createDefaultFetcher(), ...fetchers],
		);
		const resolver = new PolyfillResolver(
			Logger.create("modules-resolver"),
			registry,
			fs,
			[
				createVirtualResolver(),
				createGraphResolver(),
				createMemoryResolver(),
				createBlobResolver(),
				...resolvers,
			],
		);
		const transpiler = new Transpiler(
			Logger.create("transpiler"),
			new TranspileHandlers(Logger.create("transpile-handlers")),
			fs,
		);
		const bundler = new Bundler(
			Logger.create("bundler"),
			fetcher,
			resolver,
			transpiler,
			registry,
		);
		// todo: refactor options
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
