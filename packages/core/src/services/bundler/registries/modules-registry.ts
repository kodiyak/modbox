export class ModulesRegistry {
	private readonly modules = new Map<string, any>();

	register(path: string, module: any): void {
		if (this.modules.has(path)) {
			throw new Error(`Module for path ${path} is already registered.`);
		}

		this.modules.set(path, module);
	}

	getModule(path: string): any | undefined {
		return this.modules.get(path);
	}
}
