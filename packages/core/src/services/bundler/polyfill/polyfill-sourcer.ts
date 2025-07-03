import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import type { BundlerRegistry } from "../bundler-registry";
import type {
	SourceMiddlewareProps,
	SourceResult,
	SourcerHook,
} from "../types";

type DefaultSourcer = (
	url: string,
	parent: string,
	options: RequestInit | undefined,
) => Promise<SourceResult>;

type PolyfillSourcerHook = SourcerHook & { name: string };

export class PolyfillSourcer {
	private readonly hooks: PolyfillSourcerHook[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fs: VirtualFiles,
		hooks: PolyfillSourcerHook[] = [],
	) {
		this.hooks = hooks;
		this.logger = logger;
		this.registry = registry;
		this.fs = fs;
	}

	async source(
		url: string,
		options: RequestInit | undefined,
		parent: string,
		defaultSource: DefaultSourcer,
	): Promise<SourceResult> {
		return this.runHooks(url, parent, options, defaultSource);
	}

	private async runHooks(
		url: string,
		parent: string,
		options: RequestInit | undefined,
		defaultSource: DefaultSourcer,
	): Promise<SourceResult> {
		const executeHook = async (
			index: number,
			currentUrl: string,
			currentParent: string,
			currentOptions: RequestInit | undefined,
		): Promise<SourceResult> => {
			const hook = this.hooks[index];
			if (!hook) {
				return defaultSource(currentUrl, currentParent, currentOptions);
			}

			const next = (props?: Partial<Omit<SourceMiddlewareProps, "next">>) => {
				return executeHook(
					index + 1,
					props?.url ?? currentUrl,
					props?.parent ?? currentParent,
					props?.options ?? currentOptions,
				);
			};

			const props: Parameters<SourcerHook["source"]>[0] = {
				url: currentUrl,
				parent: currentParent,
				options: currentOptions,
				logger: this.logger.namespace(hook.name),
				registry: this.registry,
				fs: this.fs,
				next,
			};
			const result = await Promise.resolve(hook.source(props));
			this.logger.info(
				`Sourcer "${hook.name}" [${currentUrl} => ${result?.type}]`,
			);

			if (result !== undefined) {
				return result;
			}

			return next();
		};

		return executeHook(0, url, parent, options);
	}
}
