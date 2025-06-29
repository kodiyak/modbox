import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../virtual-files";
import type {
	BlobsRegistry,
	ExternalRegistry,
	GraphRegistry,
	ModulesRegistry,
} from "../registries";
import type { FetcherHook, FetcherResult } from "../types";

type DefaultFetcher = (
	url: string,
	opts: RequestInit | undefined,
) => Promise<Response>;

export class PolyfillFetcher {
	private readonly hooks: FetcherHook[] = [];
	private readonly logger: Logger;
	private readonly blobsRegistry: BlobsRegistry;
	private readonly graphRegistry: GraphRegistry;
	private readonly modulesRegistry: ModulesRegistry;
	private readonly externalRegistry: ExternalRegistry;
	private readonly fs: VirtualFiles;

	constructor(
		logger: Logger,
		blobsRegistry: BlobsRegistry,
		graphRegistry: GraphRegistry,
		modulesRegistry: ModulesRegistry,
		externalRegistry: ExternalRegistry,
		fs: VirtualFiles,
		hooks: FetcherHook[] = [],
	) {
		this.hooks = hooks;
		this.logger = logger;
		this.blobsRegistry = blobsRegistry;
		this.graphRegistry = graphRegistry;
		this.modulesRegistry = modulesRegistry;
		this.externalRegistry = externalRegistry;
		this.fs = fs;
	}

	async fetch(url: string, opts: RequestInit, defaultFetch: DefaultFetcher) {
		this.logger.debug(
			`Fetching URL: ${url} with options: ${JSON.stringify(opts)}`,
		);
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
				hook.fetch(
					{
						url: currentUrl,
						options: currentOpts,
						next,
					},
					{
						logger: this.logger,
						blobsRegistry: this.blobsRegistry,
						graphRegistry: this.graphRegistry,
						modulesRegistry: this.modulesRegistry,
						externalRegistry: this.externalRegistry,
						fs: this.fs,
					},
				),
			);

			if (result !== undefined && result instanceof Response) {
				this.logger.debug(
					`Hook ${index} returned a response for ${currentUrl}`,
				);
				return result;
			}

			this.logger.debug(
				`Hook ${index} did not return a response for ${currentUrl}, continuing to next hook.`,
			);
			return next();
		};

		return executeHook(0, url, opts);
	}
}
