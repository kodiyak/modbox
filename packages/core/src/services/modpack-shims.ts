import type { Orchestrator } from "./orchestrator";
import type { EsmsInitOptions, IImportShim, ModpackShimsInit } from "./types";

export class ModpackShims {
	private static instance: ModpackShims | null = null;

	static getInstance(): ModpackShims {
		if (!ModpackShims.instance) {
			ModpackShims.instance = new ModpackShims();
		}
		return ModpackShims.instance;
	}

	public isReady = false;

	private get window() {
		return globalThis.window || globalThis;
	}

	public get importShim() {
		return (this.window as any).importShim as IImportShim;
	}

	private orchestrators: Orchestrator[] = [];

	addOrchestrator(orchestrator: Orchestrator) {
		this.orchestrators.push(orchestrator);
	}

	/**
	 * Setups Es-Module-Shims for the Modpack.
	 *  - Grants single es-module-shims script.
	 *  - Pipes the `es-module-shims` hooks to the Modpacks Instances.
	 *  - Orchestrate multiple instances of the Modpack.
	 */
	static async init(options: ModpackShimsInit) {
		const self = ModpackShims.getInstance();

		return new Promise<void>((resolve, reject) => {
			const script = window.document.createElement("script");
			const esmsOptions: EsmsInitOptions = {
				...ModpackShims.getEsmsInitOptions(),
				...options,
				source: async (url, options, parentUrl, defaultSourceHook) => {
					for (const orchestrator of self.orchestrators) {
						const source = await orchestrator.bundler.sourcer.source(
							url,
							options,
							parentUrl,
							defaultSourceHook,
						);
						if (source) {
							return source;
						}
					}

					return defaultSourceHook(url, options, parentUrl);
				},
				fetch: async (url, opts) => {
					for (const orchestrator of self.orchestrators) {
						const response = await orchestrator.bundler.fetcher.fetch(
							url,
							opts,
							(url, opts) => fetch(url, opts),
						);
						if (response) {
							return response;
						}
					}

					return fetch(url, opts);
				},
				// onimport: (url, options, parentUrl, source) => {
				// 	return self.onImport(url, options, parentUrl, source);
				/**
				 * - Editar o parent n é o lance
				 * - Preciso usar o file:///virtual-pkg/**
				 * - O lance talvez seja manter a estrutura de arquivos com o prefixo
				 * - E também usar o prefixo aqui pra identificar o orchestrator
				 * - É ISSO, QUASE CERTO Q RESOLVEREMOS, APENAS COLOCANDO O PREFIXO NOS ARQUIVOS E USANDO O PREFIXO AQUI PRA ACHAR O ORQUESTRADOR APENAS.
				 */
				// },
				resolve: (id, parentUrl, defaultResolve) => {
					for (const orchestrator of self.orchestrators) {
						const resolved = orchestrator.bundler.resolver.resolve(
							id,
							parentUrl,
							defaultResolve,
						);
						if (resolved) {
							return resolved;
						}
					}

					return defaultResolve(id, parentUrl);
				},
			};
			const version = esmsOptions?.version || "2.6.1";

			Object.assign(window, { esmsInitOptions: esmsOptions });
			Object.assign(script, {
				src: `https://ga.jspm.io/npm:es-module-shims@${version}/dist/es-module-shims.js`,
				async: true,
				onload: () => {
					self.isReady = true;
					resolve();
				},
				onerror: () => {
					reject(new Error("Failed to load es-module-shims"));
				},
			});

			window.document.head.appendChild(script);
		});
	}

	async import(path: string) {
		const result = await this.importShim(path);
		console.log(`Importing module: "${path}"`, { result });
		return result;
	}

	static getEsmsInitOptions(): EsmsInitOptions {
		return {
			shimMode: true,
			hotReload: true,
			hotReloadInterval: 500,
			polyfillEnable: ["all"],
			mapOverrides: true,
		};
	}
}
