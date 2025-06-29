import type { Logger } from "../../shared";
import type { ResolverHook, ResolverResult } from "./types";

type DefaultResolver = (path: string, parent: string) => ResolverResult;

export class PolyfillResolver {
	private readonly hooks: ResolverHook[] = [];
	private readonly logger: Logger;

	constructor(logger: Logger, hooks: ResolverHook[] = []) {
		this.hooks = hooks;
		this.logger = logger;
	}

	async resolve(
		path: string,
		parent: string,
		defaultResolve: DefaultResolver,
	): Promise<string> {
		return this.runHooks(path, parent, defaultResolve);
	}

	registerHook(hook: ResolverHook) {
		this.hooks.push(hook);
	}

	private async runHooks(
		path: string,
		parent: string,
		defaultResolve: DefaultResolver,
	): Promise<string> {
		const executeHook = async (
			index: number,
			currentPath: string,
			currentParent: string,
		): Promise<string> => {
			const hook = this.hooks[index];
			if (!hook) {
				return defaultResolve(currentPath, currentParent);
			}

			const next = () => {
				return executeHook(index + 1, currentPath, currentParent);
			};

			const result = await Promise.resolve(
				hook.resolve(currentPath, currentParent, next),
			);

			if (result !== undefined && typeof result === "string") {
				this.logger.debug(
					`[PolyfillResolver] Hook ${index} returned a result for ${currentPath}`,
				);
				return result;
			}

			this.logger.debug(
				`[PolyfillResolver] Hook ${index} did not return a result for ${currentPath}, continuing to next hook.`,
			);
			return next();
		};

		return executeHook(0, path, parent);
	}
}
