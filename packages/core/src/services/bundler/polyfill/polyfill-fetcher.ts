import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import type { BundlerRegistry } from "../bundler-registry";
import type { FetcherHook, FetcherResult, FetchMiddlewareProps } from "./types";

type DefaultFetcher = (
	url: string,
	opts: RequestInit | undefined,
) => Promise<Response>;

type PolyfillFetcherHook = FetcherHook & { name: string };

export class PolyfillFetcher {
	private readonly hooks: PolyfillFetcherHook[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fs: VirtualFiles,
		hooks: PolyfillFetcherHook[] = [],
	) {
		this.hooks = hooks;
		this.logger = logger;
		this.registry = registry;
		this.fs = fs;
	}

	async fetch(url: string, opts: RequestInit, defaultFetch: DefaultFetcher) {
		return this.runHooks(url, opts, defaultFetch);
	}

	private async runHooks(
		url: string,
		opts: RequestInit | undefined,
		defaultFetch: DefaultFetcher,
	): FetcherResult {
		const executeHook = async ({
			index,
			options: currentOpts,
			url: currentUrl,
		}: Omit<FetchMiddlewareProps, "next"> & {
			index: number;
		}): FetcherResult => {
			const hook = this.hooks[index];
			if (!hook) {
				return defaultFetch(currentUrl, currentOpts);
			}

			const next = () => {
				return executeHook({
					index: index + 1,
					url: currentUrl,
					options: currentOpts,
				});
			};

			const props: Parameters<FetcherHook["fetch"]>[0] = {
				url: currentUrl,
				options: currentOpts,
				next,
				logger: this.logger.namespace(hook.name),
				registry: this.registry,
				fs: this.fs,
			};
			const result = await Promise.resolve(hook.fetch(props));
			this.logger.info(
				`Fetching "${hook.name}" [${currentUrl} => ${result?.status}]`,
			);

			if (result !== undefined && result instanceof Response) {
				return result;
			}

			return next();
		};

		return executeHook({
			index: 0,
			url,
			options: opts,
		});
	}
}
