import type { GraphDependency } from "../types";

export class DependenciesRegistry {
	private dependencies = new Map<string, GraphDependency>();

	static create() {
		return new DependenciesRegistry();
	}

	addDependency(dependency: Omit<GraphDependency, "type">) {
		this.dependencies.set(dependency.path, {
			type: "dependencies",
			...dependency,
		});
	}

	getAll(): GraphDependency[] {
		return Array.from(this.dependencies.values());
	}
}
