import type { ModuleGraph } from "../types";

export class GraphRegistry {
	private readonly modules = new Map<string, ModuleGraph>();

	register(path: string, graph: ModuleGraph): void {
		if (this.modules.has(path)) {
			throw new Error(`Module graph for path ${path} is already registered.`);
		}

		this.modules.set(path, graph);
	}

	getGraph(path: string): ModuleGraph | undefined {
		return this.modules.get(path);
	}
}
