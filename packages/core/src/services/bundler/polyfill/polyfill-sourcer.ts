import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import {
	getPluginLogger,
	getPluginReporter,
	PluginReporter,
} from "../../plugins";
import type { BundlerRegistry } from "../bundler-registry";
import type {
	SourceMiddlewareProps,
	SourceResult,
	SourcerHook,
	SourcerHooks,
} from "./types";

type SourcePluginHandler = SourcerHook & { name: string };

export class PolyfillSourcer {
	private readonly handlers: SourcePluginHandler[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;
	private readonly hooks: SourcerHooks;
	private readonly reporter: PluginReporter;

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
		this.reporter = PluginReporter.create("sourcer");
	}

	async source(
		url: string,
		options: RequestInit | undefined,
		parent: string,
	): Promise<SourceResult> {
		return this.runHooks(url, parent, options);
	}

	private async runHooks(
		url: string,
		parent: string,
		options: RequestInit | undefined,
	): Promise<SourceResult> {
		const executeHook = async ({
			index,
			url: currentUrl,
			parent: currentParent,
			options: currentOptions,
		}: Omit<SourceMiddlewareProps, "next" | "reporter"> & {
			index: number;
		}): Promise<SourceResult> => {
			const hook = this.handlers[index];
			if (!hook) {
				return {
					url: currentUrl,
					parent: currentParent,
					options: currentOptions,
				};
			}

			const next = (props?: Partial<Omit<SourceMiddlewareProps, "next">>) => {
				return executeHook({
					index: index + 1,
					url: props?.url ?? currentUrl,
					parent: props?.parent ?? currentParent,
					options: props?.options ?? currentOptions,
				});
			};

			const props: Parameters<SourcerHook["source"]>[0] = {
				url: currentUrl,
				parent: currentParent,
				options: currentOptions,
				logger: getPluginLogger(hook.name),
				reporter: getPluginReporter(hook.name),
				registry: this.registry,
				fs: this.fs,
				next,
			};
			const result = await Promise.resolve(hook.source(props));
			this.logger.info(
				`Sourcer "${hook.name}" [${currentUrl} => ${result?.url}]`,
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
				// placeholder for plugin reporter and logger
				logger: this.logger,
				reporter: this.reporter,
			});

			result = await executeHook({ index: 0, url, parent, options });
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
			// placeholder for plugin reporter and logger
			logger: this.logger,
			reporter: this.reporter,
		});

		return result;
	}
}
