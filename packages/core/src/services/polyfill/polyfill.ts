import { z } from "zod";
import { EventEmitter } from "../../shared/event-emitter";
import type { PolyfillDefaultFetcher, PolyfillDefaultResolver } from "./types";

export class PolyfillModules {
	private readonly events = new EventEmitter(z.object({}), "PolyfillModules");

	private readonly fetcher: PolyfillDefaultFetcher;
	private readonly resolver: PolyfillDefaultResolver;

	constructor(
		fetcher: PolyfillDefaultFetcher,
		resolver: PolyfillDefaultResolver,
	) {
		this.fetcher = fetcher;
		this.resolver = resolver;
	}

	private getEsmsInitOptions() {
		return {
			shimMode: true,
			hotReload: true,
			hotReloadInterval: 500,
			polyfillEnable: true,
			mapOverrides: true,
			resolve: this.resolver,
			fetch: this.fetcher,
		};
	}
}
