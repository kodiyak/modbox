import { z } from "zod";
import { EventEmitter } from "../../shared/event-emitter";
import type { PolyfillFetcher, PolyfillResolver } from "./types";

export class PolyfillModules {
	private readonly events = new EventEmitter(z.object({}), "PolyfillModules");

	private readonly fetcher: PolyfillFetcher;
	private readonly resolver: PolyfillResolver;

	constructor(fetcher: PolyfillFetcher, resolver: PolyfillResolver) {
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
