import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import {
	getPluginLogger,
	getPluginReporter,
	PluginReporter,
} from "../../plugins";
import type { BundlerRegistry } from "../bundler-registry";
import type {
	FetcherHook,
	FetcherHooks,
	FetcherResult,
	FetchMiddlewareProps,
} from "./types";

type DefaultFetcher = (
	url: string,
	opts: RequestInit | undefined,
) => Promise<Response>;

type FetcherPluginHandler = FetcherHook & { name: string };

export class PolyfillFetcher {
	private readonly handlers: FetcherPluginHandler[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;
	private readonly hooks: FetcherHooks;
	private readonly reporter: PluginReporter;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fs: VirtualFiles,
		handlers: FetcherPluginHandler[] = [],
		hooks: FetcherHooks = {},
	) {
		this.handlers = handlers;
		this.logger = logger;
		this.registry = registry;
		this.fs = fs;
		this.hooks = hooks;
		this.reporter = PluginReporter.create("fetcher");
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
		}: Omit<FetchMiddlewareProps, "next" | "reporter"> & {
			index: number;
		}): FetcherResult => {
			const hook = this.handlers[index];
			if (!hook) {
				return defaultFetch(currentUrl, currentOpts);
			}

			const next = (
				props?: Partial<Parameters<FetchMiddlewareProps["next"]>[0]>,
			) => {
				return executeHook({
					index: index + 1,
					url: props?.url ?? currentUrl,
					options: props?.options ?? currentOpts,
				});
			};

			const props: Parameters<FetcherHook["fetch"]>[0] = {
				url: currentUrl ?? url,
				options: currentOpts ?? opts,
				next,
				logger: getPluginLogger(hook.name),
				reporter: getPluginReporter(hook.name),
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

		let response: Response | undefined;
		let error: Error | null = null;
		try {
			await this.hooks.onFetchStart?.({
				url,
				options: opts,
				fs: this.fs,
				logger: this.logger,
				reporter: this.reporter,
			});
			response = await executeHook({
				index: 0,
				url,
				options: opts,
			});
		} catch (err) {
			this.logger.error(`Error fetching "${url}":`, err);
			error = err as Error;
		}
		await this.hooks.onFetchEnd?.({
			url,
			options: opts,
			response,
			error,
			fs: this.fs,
			logger: this.logger,
			reporter: this.reporter,
		});

		return response;
	}
}
