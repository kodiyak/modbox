import { z } from "zod";
import type { Logger } from "../../shared";
import { EventEmitter } from "../../shared/event-emitter";
import type {
	EsmsInitOptions,
	FetcherHook,
	PolyfillInitOptions,
	ResolverHook,
} from "./types";

export class PolyfillModules {
	private readonly events = new EventEmitter(z.object({}), "PolyfillModules");

	private readonly fetcher: FetcherHook;
	private readonly resolver: ResolverHook;
	private readonly logger: Logger;

	private get window() {
		return globalThis.window || globalThis;
	}

	public isReady = false;

	constructor(logger: Logger, fetcher: FetcherHook, resolver: ResolverHook) {
		this.fetcher = fetcher;
		this.resolver = resolver;
		this.logger = logger;
	}

	public async init({ esmsInitOptions }: PolyfillInitOptions) {
		return new Promise<void>((resolve, reject) => {
			const script = this.window.document.createElement("script");
			Object.assign(script, {
				src: "https://ga.jspm.io/npm:es-module-shims@2.6.1/dist/es-module-shims.js",
				async: true,
				onload: () => {
					this.isReady = true;
					this.logger.info("[PolyfillModules] initialized successfully.");
					resolve();
				},
				onerror: (error: Event) => {
					this.logger.error("Failed to load es-module-shims:", error);
					reject(new Error("Failed to load es-module-shims"));
				},
			});
			Object.assign(this.window, {
				esmsInitOptions: {
					...this.getEsmsInitOptions(),
					...esmsInitOptions,
					resolve: this.resolver.resolve.bind(this.resolver),
					fetch: this.fetcher.fetch.bind(this.fetcher),
				},
			});
			this.window.document.head.appendChild(script);
			this.logger.info("[PolyfillModules] script tag created.");
		});
	}

	private getEsmsInitOptions(): EsmsInitOptions {
		return {
			shimMode: true,
			hotReload: true,
			hotReloadInterval: 500,
			polyfillEnable: ["all"],
			mapOverrides: true,
		};
	}
}
