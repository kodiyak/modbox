import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import type { BundlerRegistry } from "../bundler-registry";
import type { FetcherHook, FetcherResult } from "../types";

type DefaultFetcher = (
	url: string,
	opts: RequestInit | undefined,
) => Promise<Response>;

export class PolyfillFetcher {
	private readonly hooks: FetcherHook[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fs: VirtualFiles,
		hooks: FetcherHook[] = [],
	) {
		this.hooks = hooks;
		this.logger = logger;
		this.registry = registry;
		this.fs = fs;
	}

	async fetch(url: string, opts: RequestInit, defaultFetch: DefaultFetcher) {
		return this.runHooks(url, opts, defaultFetch);
	}

	registerHook(hook: FetcherHook) {
		this.hooks.push(hook);
	}

	private async runHooks(
		url: string,
		opts: RequestInit | undefined,
		defaultFetch: DefaultFetcher,
	): FetcherResult {
		const executeHook = async (
			index: number,
			currentUrl: string,
			currentOpts: RequestInit | undefined,
		): FetcherResult => {
			const hook = this.hooks[index];
			if (!hook) {
				return defaultFetch(currentUrl, currentOpts);
			}

			const next = () => {
				return executeHook(index + 1, currentUrl, currentOpts);
			};

			const result = await Promise.resolve(
				hook.fetch({
					url: currentUrl,
					options: currentOpts,
					next,
					logger: this.logger,
					registry: this.registry,
					fs: this.fs,
				}),
			);

			if (result !== undefined && result instanceof Response) {
				this.logger.debug(
					`[Hook][${index}][${currentUrl}] Response received.`,
					result,
				);
				return result;
			}

			return next();
		};

		return executeHook(0, url, opts);
	}
}
