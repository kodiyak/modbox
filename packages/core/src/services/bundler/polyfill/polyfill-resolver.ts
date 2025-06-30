import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import type { BundlerRegistry } from "../bundler-registry";
import type {
	ResolveMiddlewareProps,
	ResolverHook,
	ResolverResult,
} from "../types";

type DefaultResolver = (path: string, parent: string) => ResolverResult;

export class PolyfillResolver {
	private readonly hooks: ResolverHook[] = [];
	private readonly logger: Logger;
	private readonly registry: BundlerRegistry;
	private readonly fs: VirtualFiles;

	constructor(
		logger: Logger,
		registry: BundlerRegistry,
		fs: VirtualFiles,
		hooks: ResolverHook[] = [],
	) {
		this.hooks = hooks;
		this.logger = logger;
		this.registry = registry;
		this.fs = fs;
	}

	resolve(
		path: string,
		parent: string,
		defaultResolve: DefaultResolver,
	): string {
		return this.runHooks(path, parent, defaultResolve);
	}

	registerHook(hook: ResolverHook) {
		this.hooks.push(hook);
	}

	private runHooks(
		path: string,
		parent: string,
		defaultResolve: DefaultResolver,
	): string {
		const executeHook = (
			index: number,
			currentPath: string,
			currentParent: string,
		): string => {
			const hook = this.hooks[index];
			if (!hook) {
				return defaultResolve(currentPath, currentParent);
			}

			const next: ResolveMiddlewareProps["next"] = (props) => {
				return executeHook(
					index + 1,
					props?.path ?? currentPath,
					props?.parent ?? currentParent,
				);
			};

			const result = hook.resolve({
				path: currentPath,
				parent: currentParent,
				next,
				logger: this.logger.namespace(`HOOK_${index}`),
				registry: this.registry,
				fs: this.fs,
			});

			if (result !== undefined && typeof result === "string") {
				this.logger.debug(
					`[Hook][${index}][${currentPath}] Path received.`,
					result ?? "[NO_RESULT]",
				);
				return result;
			}

			return next();
		};

		return executeHook(0, path, parent);
	}
}
