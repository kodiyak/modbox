import type { PolyfillFetcher, PolyfillResolver } from "../services";
import { Logger } from "../shared/logger";
import type { OrchestratorOptions } from "./types";

export class Orchestrator {
	public readonly logger: Logger;
	public readonly fetcher: PolyfillFetcher;
	public readonly resolver: PolyfillResolver;

	constructor(
		options: OrchestratorOptions = {},
		fetcher: PolyfillFetcher,
		resolver: PolyfillResolver,
	) {
		this.logger = new Logger(options.debug ? "debug" : "none");
		this.fetcher = fetcher;
		this.resolver = resolver;
	}
}
