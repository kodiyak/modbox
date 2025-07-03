import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import type { BundlerRegistry } from "../bundler-registry";
import type { TransformerHook, TransformMiddlewareProps } from "../types";

type PolyfillTransformerHook = TransformerHook & { name: string };

export class PolyfillTransformer {
	private readonly hooks: PolyfillTransformerHook[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fs: VirtualFiles,
		hooks: PolyfillTransformerHook[] = [],
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

			this.logger.info(`Running "${hook.name}" transformer hook`);
			const result = await Promise.resolve(
				hook.transform({
					source: currentSource,
					url: currentUrl,
					logger: this.logger.namespace(hook.name),
					registry: this.registry,
					fs: this.fs,
					next,
				}),
			);

			if (typeof result === "string") {
				return result;
			}

			return next();
		};

		return executeHook(0, source, url);
	}
}
