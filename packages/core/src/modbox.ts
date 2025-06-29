import { Orchestrator } from "./orchestrator";
import {
	BlobsRegistry,
	Bundler,
	createDefaultExportsExtractor,
	createDefaultFetcher,
	createDefaultImportsExtractor,
	createGraphResolver,
	createLoggerExtractor,
	createVirtualResolver,
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
		const registries = {
			blobs: new BlobsRegistry(Logger.create("blobs-registry")),
			graph: new GraphRegistry(Logger.create("graph-registry")),
			modules: new ModulesRegistry(Logger.create("modules-registry")),
			external: new ExternalRegistry(Logger.create("external-registry")),
		};
		const fetcher = new PolyfillFetcher(
			Logger.create("modules-fetcher"),
			registries.blobs,
			registries.graph,
			registries.modules,
			registries.external,
			fs,
			[createDefaultFetcher(), ...fetchers],
		);
		const resolver = new PolyfillResolver(
			Logger.create("modules-resolver"),
			registries.blobs,
			registries.graph,
			registries.modules,
			registries.external,
			fs,
			[createVirtualResolver(), createGraphResolver(), ...resolvers],
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
