import { Orchestrator } from "./orchestrator";
import {
	createDefaultExportsExtractor,
	createDefaultImportsExtractor,
	DependenciesRegistry,
	ExportsRegistry,
	GraphBuilder,
	ModulesExtractor,
	PolyfillFetcher,
	PolyfillResolver,
	VirtualFiles,
} from "./services";
import { Logger } from "./shared";
import type { ModboxBootOptions } from "./types";

export class Modbox {
	static boot({
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
		const exportsRegistry = new ExportsRegistry();
		const dependenciesRegistry = new DependenciesRegistry();
		const extractor = new ModulesExtractor(logger, [
			createDefaultExportsExtractor(dependenciesRegistry, exportsRegistry),
			createDefaultImportsExtractor(dependenciesRegistry, exportsRegistry),
		]);

		return new Orchestrator(
			{ debug },
			new PolyfillFetcher(logger, fetchers),
			new PolyfillResolver(logger, resolvers),
			new GraphBuilder(logger, fs, extractor, graphOptions || {}),
		);
	}
}
