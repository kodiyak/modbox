export class GraphDependencyNotFoundError extends Error {
	constructor(missingDependency: string, dependentPath: string) {
		super(
			`Dependency "${missingDependency}" not found for module at "${dependentPath}".`,
		);
		this.name = "GraphDependencyNotFoundError";
	}
}
