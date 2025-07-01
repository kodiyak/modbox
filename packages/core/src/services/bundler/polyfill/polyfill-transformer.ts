import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import type { BundlerRegistry } from "../bundler-registry";
import type { TransformerHook, TransformMiddlewareProps } from "../types";

export class PolyfillTransformer {
	private readonly hooks: TransformerHook[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fs: VirtualFiles,
		hooks: TransformerHook[] = [],
	) {
		this.hooks = hooks;
		this.logger = logger;
		this.registry = registry;
		this.fs = fs;
	}

	async transform(
		source: string,
		url: string,
		defaultTransform: (source: string, url: string) => Promise<string> | string,
	) {
		return this.runHooks(source, url, defaultTransform);
	}

	registerHook(hook: TransformerHook) {
		this.hooks.push(hook);
	}

	private async runHooks(
		source: string,
		url: string,
		defaultTransform: (source: string, url: string) => Promise<string> | string,
	): Promise<string> {
		const executeHook = async (
			index: number,
			currentSource: string,
			currentUrl: string,
		): Promise<string> => {
			const hook = this.hooks[index];
			if (!hook) {
				return Promise.resolve(defaultTransform(currentSource, currentUrl));
			}

			const next = (props?: Partial<Omit<TransformMiddlewareProps, "next">>) =>
				executeHook(
					index + 1,
					props?.source ?? currentSource,
					props?.url ?? currentUrl,
				);

			const result = await Promise.resolve(
				hook.transform({
					source: currentSource,
					url: currentUrl,
					logger: this.logger,
					registry: this.registry,
					fs: this.fs,
					next,
				}),
			);

			if (typeof result === "string") {
				this.logger.debug(
					`[TranspileHook][${index}][${currentUrl}] Transformed source received.`,
					result,
				);
				return result;
			}

			return next();
		};

		return executeHook(0, source, url);
	}
}
