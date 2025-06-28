import type { TranspilerRegistry } from "./transpiler-registry";

export class Transpiler {
	private readonly registry: TranspilerRegistry;
	constructor(registry: TranspilerRegistry) {
		this.registry = registry;
	}

	async transpile(
		filePath: string,
		code: string,
		options?: any,
	): Promise<{ code: string; map?: string } | null> {
		const kind = this.registry.identifyModuleKind(filePath, code);
		const transpilerFn = this.registry.getTranspiler(kind);

		if (!transpilerFn) {
			return null;
		}

		try {
			return await transpilerFn(code, filePath, options);
		} catch (error) {
			console.error(
				`[Transpiler] Error transpiling ${filePath} with kind ${kind}:`,
				error,
			);
			return null;
		}
	}
}
