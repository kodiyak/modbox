import type { Logger } from "../../shared";
import type { FetcherHook, FetcherResult } from "./types";

type DefaultFetcher = (
	url: string,
	opts: RequestInit | undefined,
) => Promise<Response>;

export class PolyfillFetcher {
	private readonly hooks: FetcherHook[] = [];
	private readonly logger: Logger;

	constructor(logger: Logger, hooks: FetcherHook[] = []) {
		this.hooks = hooks;
		this.logger = logger;
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
				hook.fetch(currentUrl, currentOpts, next),
			);

			if (result !== undefined && result instanceof Response) {
				this.logger.debug(
					`[PolyfillFetcher] Hook ${index} returned a response for ${currentUrl}`,
				);
				return result;
			}

			this.logger.debug(
				`[PolyfillFetcher] Hook ${index} did not return a response for ${currentUrl}, continuing to next hook.`,
			);
			return next();
		};

		return executeHook(0, url, opts);
	}
}
