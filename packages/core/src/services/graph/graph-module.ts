import type { GraphDependency, GraphExported, GraphModuleProps } from "./types";

type GraphModuleInstanceProps = Omit<
	GraphModuleProps,
	"dependencies" | "exported"
>;

export class GraphModule {
	public path: string;
	private originalPath: string;
	private runtime?: string;
	public dependencies = new Map<string, string[]>();
	public exported: string[] = [];

	constructor(props: GraphModuleInstanceProps) {
		this.path = props.path;
		this.originalPath = props.originalPath;
		this.runtime = props.runtime;
	}

	static create(props: GraphModuleInstanceProps): GraphModule {
		return new GraphModule(props);
	}

	addExports(exported: GraphExported[]) {
		for (const exp of exported) {
			if (!this.exported.includes(exp.name)) {
				this.exported.push(exp.name);
			}
		}
		return this;
	}

	addDependencies(dependencies: Omit<GraphDependency, "type">[]) {
		for (const dep of dependencies) {
			if (!this.dependencies.has(dep.path)) {
				this.dependencies.set(dep.path, dep.names);
			} else {
				const existingNames = this.dependencies.get(dep.path) || [];
				for (const name of dep.names) {
					if (!existingNames.includes(name)) {
						existingNames.push(name);
					}
				}
				this.dependencies.set(dep.path, existingNames);
			}
		}
		return this;
	}

	toJSON() {
		return {
			path: this.path,
			originalPath: this.originalPath,
			runtime: this.runtime,
			dependencies: Object.fromEntries(this.dependencies.entries()),
			exported: this.exported,
		};
	}
}
