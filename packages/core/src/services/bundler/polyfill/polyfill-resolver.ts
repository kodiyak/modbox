import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import {
	getPluginLogger,
	getPluginReporter,
	PluginReporter,
} from "../../plugins";
import type { BundlerRegistry } from "../bundler-registry";
import type {
	ResolveMiddlewareProps,
	ResolverHook,
	ResolverHooks,
} from "./types";

type DefaultResolver = (path: string, parent: string) => string | undefined;
type PolyfillResolverHook = ResolverHook & { name: string };

export class PolyfillResolver {
	private readonly handlers: PolyfillResolverHook[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;
	private readonly hooks: ResolverHooks;
	private readonly reporter: PluginReporter;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fs: VirtualFiles,
		handlers: PolyfillResolverHook[] = [],
		hooks: ResolverHooks = {},
	) {
		this.handlers = handlers;
		this.logger = logger;
		this.registry = registry;
		this.fs = fs;
		this.hooks = hooks;
		this.reporter = PluginReporter.create("resolver");
	}

	resolve(
		path: string,
		parent: string,
		defaultResolve: DefaultResolver,
	): string | undefined {
		return this.runHooks(path, parent, defaultResolve);
	}

	private runHooks(
		path: string,
		parent: string,
		defaultResolve: DefaultResolver,
	): string | undefined {
		const executeHook = ({
			index,
			path: currentPath,
			parent: currentParent,
		}: Omit<ResolveMiddlewareProps, "next" | "reporter"> & {
			index: number;
		}): string | undefined => {
			const hook = this.handlers[index];
			if (!hook) {
				return defaultResolve(currentPath, currentParent);
			}

			const next: ResolveMiddlewareProps["next"] = (props) => {
				return executeHook({
					index: index + 1,
					path: props?.path ?? currentPath,
					parent: props?.parent ?? currentParent,
				});
			};

			const props: Parameters<ResolverHook["resolve"]>[0] = {
				path: currentPath,
				parent: currentParent,
				next,
				logger: getPluginLogger(hook.name),
				reporter: getPluginReporter(hook.name),
				registry: this.registry,
				fs: this.fs,
			};
			const result = hook.resolve(props);
			this.logger.debug(
				`Resolver "${hook.name}" [${currentPath} => ${result}]`,
			);

			if (result !== undefined && typeof result === "string") {
				return result;
			}

			return next();
		};

		let result: string | undefined;
		let error: Error | null = null;

		try {
			this.hooks.onResolveStart?.({
				path,
				parent,
				fs: this.fs,
				// placeholder for plugin reporter and logger
				logger: this.logger,
				reporter: this.reporter,
			});
			result = executeHook({ index: 0, path, parent });
			this.hooks.onResolveEnd?.({
				path,
				parent,
				result,
				error: null,
				fs: this.fs,
				// placeholder for plugin reporter and logger
				logger: this.logger,
				reporter: this.reporter,
			});
		} catch (err) {
			error = err instanceof Error ? err : new Error(String(err));
			this.logger.error(
				`Error resolving "${path}" (parent: "${parent}"):`,
				error,
			);
			this.hooks.onResolveEnd?.({
				path,
				parent,
				result: undefined,
				error,
				fs: this.fs,
				// placeholder for plugin reporter and logger
				logger: this.logger,
				reporter: this.reporter,
			});
		}

		return result;
	}
}
