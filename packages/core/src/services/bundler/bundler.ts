import { z } from "zod";
import type { Logger } from "../../shared";
import { EventEmitter } from "../../shared/event-emitter";
import type { BundlerRegistry } from "./bundler-registry";
import type {
	PolyfillFetcher,
	PolyfillResolver,
	PolyfillSourcer,
	PolyfillTransformer,
} from "./polyfill";
import type {
	BundlerBuildOptions,
	EsmsInitOptions,
	IImportShim,
	PolyfillInitOptions,
} from "./types";

export class Bundler {
	// @ts-expect-error: This is a placeholder for the events type, which can be defined later.
	private readonly events = new EventEmitter(z.object({}), "PolyfillModules");

	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;

	private readonly fetcher: PolyfillFetcher;
	private readonly resolver: PolyfillResolver;
	private readonly transformer: PolyfillTransformer;
	private readonly sourcer: PolyfillSourcer;

	private get window() {
		return globalThis.window || globalThis;
	}

	private get shims() {
		return (this.window as any).importShim as IImportShim;
	}

	private isReady = false;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fetcher: PolyfillFetcher,
		resolver: PolyfillResolver,
		transformer: PolyfillTransformer,
		sourcer: PolyfillSourcer,
	) {
		this.logger = logger;
		this.registry = registry;
		this.fetcher = fetcher;
		this.resolver = resolver;
		this.transformer = transformer;
		this.sourcer = sourcer;
	}

	private async init(options: PolyfillInitOptions) {
		const { esmsInitOptions } = options;
		return new Promise<void>((resolve, reject) => {
			const script = this.window.document.createElement("script");
			const version = esmsInitOptions?.version || "2.6.1";
			Object.assign(script, {
				src: `https://ga.jspm.io/npm:es-module-shims@${version}/dist/es-module-shims.js`,
				async: true,
				onload: () => {
					this.isReady = true;
					resolve();
				},
				onerror: (error: Event) => {
					this.logger.error(
						"[es-module-shims] Failed to load es-module-shims:",
						error,
					);
					reject(new Error("Failed to load es-module-shims"));
				},
			});
			Object.assign(this.window, {
				esmsInitOptions: {
					...this.getEsmsInitOptions(),
					...esmsInitOptions,
					source: this.sourcer.source.bind(this.sourcer),
					resolve: this.resolver.resolve.bind(this.resolver),
					fetch: async (url: string, opts: RequestInit) => {
						const result = await this.fetcher.fetch(url, opts, () => {
							return fetch(url, opts);
						});

						if (!result || !result.ok) return result;

						const transformedResult = await this.transformer.transform(
							await result.text(),
							url,
							(source) => source,
						);

						return new Response(transformedResult, {
							headers: {
								"Content-Type": "application/javascript",
								"Content-Length": transformedResult.length.toString(),
							},
						});
					},
				},
			});
			this.window.document.head.appendChild(script);
		});
	}

	public async build(entrypoint: string, options: BundlerBuildOptions) {
		if (!this.isReady) {
			await this.init({ esmsInitOptions: this.getEsmsInitOptions() });
		}

		Object.entries(options.inject ?? {}).forEach(([key, value]) => {
			this.registry.get("modules").register(key, value);
		});

		const m = await this.import(entrypoint);
		this.logger.info("Build completed.", { m });
		return m;
	}

	public import(path: string): Promise<any> {
		if (!this.isReady) {
			return Promise.reject(new Error("Bundler is not initialized."));
		}

		this.logger.debug(`Importing module: ${path}`);
		return (this.shims as any)(path);
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
