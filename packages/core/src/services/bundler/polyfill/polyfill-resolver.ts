import type { Logger } from "../../../shared";
import type { VirtualFiles } from "../../../shared/virtual-files";
import type {
	BlobsRegistry,
	ExternalRegistry,
	GraphRegistry,
	ModulesRegistry,
} from "../registries";
import type { ResolverHook, ResolverResult } from "../types";

type DefaultResolver = (path: string, parent: string) => ResolverResult;

export class PolyfillResolver {
	private readonly hooks: ResolverHook[] = [];
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
		hooks: ResolverHook[] = [],
	) {
		this.hooks = hooks;
		this.logger = logger;
		this.blobsRegistry = blobsRegistry;
		this.graphRegistry = graphRegistry;
		this.modulesRegistry = modulesRegistry;
		this.externalRegistry = externalRegistry;
		this.fs = fs;

		this.logger.debug(`Initialized with ${hooks.length} hooks.`);
	}

	resolve(
		path: string,
		parent: string,
		defaultResolve: DefaultResolver,
	): string {
		this.logger.debug(`Resolving path: ${path} with parent: ${parent}.`);
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
				this.logger.debug(
					[
						`No more hooks to execute at index ${index}`,
						`Using default resolver for path: ${currentPath}`,
						`Parent: ${currentParent}`,
					].join("\n"),
				);
				return defaultResolve(currentPath, currentParent);
			}

			const next = () => {
				return executeHook(index + 1, currentPath, currentParent);
			};

			this.logger.debug(
				`Executing hook "${index}" for path: ${currentPath}, parent: ${currentParent}`,
				hook.constructor.name,
			);
			const result = hook.resolve(
				{
					path: currentPath,
					parent: currentParent,
					next,
				},
				{
					logger: this.logger.namespace(`HOOK_${index}`),
					blobsRegistry: this.blobsRegistry,
					graphRegistry: this.graphRegistry,
					modulesRegistry: this.modulesRegistry,
					externalRegistry: this.externalRegistry,
					fs: this.fs,
				},
			);

			if (result !== undefined && typeof result === "string") {
				this.logger.debug(`Hook ${index} returned a result for ${currentPath}`);
				return result;
			}

			this.logger.debug(
				`Hook ${index} did not return a result for ${currentPath}, continuing to next hook.`,
			);
			return next();
		};

		return executeHook(0, path, parent);
	}
}
