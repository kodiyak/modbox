import type { GraphDependency } from "../types";

export class DependenciesRegistry {
	private dependencies = new Map<string, GraphDependency>();

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
