import { Orchestrator } from "./orchestrator";
import {
	BlobsRegistry,
	Bundler,
	createDefaultExportsExtractor,
	createDefaultImportsExtractor,
	createLoggerExtractor,
	ExternalRegistry,
	GraphBuilder,
	GraphRegistry,
	ModulesExtractor,
	ModulesRegistry,
	PolyfillFetcher,
	PolyfillResolver,
	TranspileHandlers,
	Transpiler,
	VirtualFiles,
} from "./services";
import { Logger } from "./shared";
import type { ModboxBootOptions } from "./types";

export class Modbox {
	static async boot({ debug, fetchers, resolvers }: ModboxBootOptions) {
		if (debug) Logger.enable("*");
		const fs = new VirtualFiles();
		const extractor = new ModulesExtractor(Logger.create("modules-extractor"), [
			createDefaultExportsExtractor(),
			createDefaultImportsExtractor(),
			createLoggerExtractor(),
		]);
		await extractor.preload();
		const fetcher = new PolyfillFetcher(
			Logger.create("modules-fetcher"),
			fetchers,
		);
		// todo: inject registries
		const resolver = new PolyfillResolver(
			Logger.create("modules-resolver"),
			new BlobsRegistry(Logger.create("blobs-registry")),
			new GraphRegistry(Logger.create("graph-registry")),
			new ModulesRegistry(Logger.create("modules-registry")),
			new ExternalRegistry(Logger.create("external-registry")),
			resolvers,
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
