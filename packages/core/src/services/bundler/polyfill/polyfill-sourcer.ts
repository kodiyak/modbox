import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import type { BundlerRegistry } from "../bundler-registry";
import type {
	SourceMiddlewareProps,
	SourceResult,
	SourcerHook,
	SourcerHooks,
} from "./types";

type DefaultSourcer = (
	url: string,
	parent: string,
	options: RequestInit | undefined,
) => Promise<SourceResult>;

type SourcePluginHandler = SourcerHook & { name: string };

export class PolyfillSourcer {
	private readonly handlers: SourcePluginHandler[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;
	private readonly hooks: SourcerHooks;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fs: VirtualFiles,
		handlers: SourcePluginHandler[] = [],
		hooks: SourcerHooks = {},
	) {
		this.handlers = handlers;
		this.logger = logger;
		this.registry = registry;
		this.fs = fs;
		this.hooks = hooks;
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
			const hook = this.handlers[index];
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

		let result: SourceResult | undefined;
		let error: Error | null = null;
		try {
			await this.hooks.onSourceStart?.({
				url,
				parent,
				options,
				fs: this.fs,
				logger: this.logger,
			});

			result = await executeHook(0, url, parent, options);
		} catch (err: any) {
			error = err as Error;
			this.logger.error(
				`Error in sourcer "${this.handlers[0]?.name}": ${error.message}`,
			);
		}

		await this.hooks.onSourceEnd?.({
			url,
			parent,
			options,
			result,
			error,
			fs: this.fs,
			logger: this.logger,
		});

		if (!result) {
			throw new Error(
				`Failed to source "${url}" from "${parent}". No source returned.`,
			);
		}

		return result;
	}
}
