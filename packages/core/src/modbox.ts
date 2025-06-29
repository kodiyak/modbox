import { Orchestrator } from "./orchestrator";
import {
	Bundler,
	createDefaultExportsExtractor,
	createDefaultImportsExtractor,
	createLoggerExtractor,
	GraphBuilder,
	ModulesExtractor,
	PolyfillFetcher,
	PolyfillResolver,
	VirtualFiles,
} from "./services";
import { Logger } from "./shared";
import type { ModboxBootOptions } from "./types";

export class Modbox {
	static async boot({
		debug,
		fetchers,
		logger,
		resolvers,
		graphOptions,
	}: ModboxBootOptions) {
		if (!logger) {
			logger = new Logger(debug ? ("debug" as const) : ("info" as const));
		}

		const fs = new VirtualFiles();
		const extractor = new ModulesExtractor(logger, [
			createDefaultExportsExtractor(),
			createDefaultImportsExtractor(),
			createLoggerExtractor(),
		]);
		await extractor.preload();
		const fetcher = new PolyfillFetcher(logger, fetchers);
		const resolver = new PolyfillResolver(logger, resolvers);
		const bundler = new Bundler(logger, fetcher, resolver);
		const graphBuilder = new GraphBuilder(
			logger,
			fs,
			extractor,
			graphOptions || {},
		);

		return new Orchestrator({ debug }, bundler, graphBuilder, fs);
	}
}
