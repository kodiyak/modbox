import type { Logger } from "../../shared";
import { ModpackShims } from "../modpack-shims";
import type { BundlerRegistry } from "./bundler-registry";
import type {
	PolyfillFetcher,
	PolyfillResolver,
	PolyfillSourcer,
} from "./polyfill";
import type { BundlerBuildOptions } from "./types";

export class Bundler {
	private readonly logger: Logger;
	public readonly fetcher: PolyfillFetcher;
	public readonly resolver: PolyfillResolver;
	public readonly sourcer: PolyfillSourcer;

	private get modpackShims() {
		return ModpackShims.getInstance();
	}

	// @ts-ignore
	private isReady = false;

	constructor(
		logger: Logger,
		_: BundlerRegistry,
		fetcher: PolyfillFetcher,
		resolver: PolyfillResolver,
		sourcer: PolyfillSourcer,
	) {
		this.logger = logger;
		this.fetcher = fetcher;
		this.resolver = resolver;
		this.sourcer = sourcer;
	}

	public async build(entrypoint: string, _: BundlerBuildOptions) {
		const m = await this.import(entrypoint);
		this.logger.info("Build completed.", { m });
		return m;
	}

	public async import(path: string): Promise<any> {
		if (!this.modpackShims.isReady) {
			return Promise.reject(new Error("Bundler is not initialized."));
		}

		const m = await this.modpackShims.import(path);
		this.logger.debug(`Importing module: ${path}`, { m });

		return m;
	}

	public async refresh(path: string) {
		const importResult = await this.import(path);
		const hotResult = await this.modpackShims.importShim.hotReload(path);

		return {
			updated: hotResult,
			module: importResult,
		};
	}
}
