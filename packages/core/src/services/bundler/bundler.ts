import { z } from "zod";
import type { Logger } from "../../shared";
import { EventEmitter } from "../../shared/event-emitter";
import type { BundlerRegistry } from "./bundler-registry";
import type { PolyfillFetcher, PolyfillResolver } from "./polyfill";
import type {
	BundlerBuildOptions,
	EsmsInitOptions,
	IImportShim,
	PolyfillInitOptions,
} from "./types";

export class Bundler {
	private readonly events = new EventEmitter(z.object({}), "PolyfillModules");

	private readonly fetcher: PolyfillFetcher;
	private readonly resolver: PolyfillResolver;
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;

	private get window() {
		return globalThis.window || globalThis;
	}

	private get shims() {
		return (this.window as any).importShim as IImportShim;
	}

	private isReady = false;

	constructor(
		logger: Logger,
		fetcher: PolyfillFetcher,
		resolver: PolyfillResolver,
		registry: BundlerRegistry,
	) {
		this.fetcher = fetcher;
		this.resolver = resolver;
		this.logger = logger;
		this.registry = registry;
	}

	private async init(options: PolyfillInitOptions) {
		const { esmsInitOptions } = options;
		return new Promise<void>((resolve, reject) => {
			const script = this.window.document.createElement("script");
			const version = esmsInitOptions?.version || "2.5.1";
			Object.assign(script, {
				src: `https://ga.jspm.io/npm:es-module-shims@${version}/dist/es-module-shims.js`,
				async: true,
				onload: () => {
					this.isReady = true;
					this.logger.info(
						"[es-module-shims] Initialized successfully.",
						options,
					);
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
			this.logger.info("script tag created.");
		});
	}

	public async build(entrypoint: string, options: BundlerBuildOptions) {
		if (!this.isReady) {
			this.logger.warn("Not ready, initializing...");
			await this.init({ esmsInitOptions: this.getEsmsInitOptions() });
		} else {
			this.logger.info("Already initialized.");
		}

		this.logger.info("Starting build process...");
		this.logger.debug(`Entry point: "${entrypoint}"`);
		this.logger.debug(`Options:`, options);

		Object.entries(options.inject ?? {}).forEach(([key, value]) => {
			this.registry.get("modules").register(key, value);
		});

		// await this.transpiler.transpile();

		const m = await this.import(entrypoint);
		this.logger.info("Build completed.", { m });
		return m;
	}

	private import(path: string): Promise<any> {
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
