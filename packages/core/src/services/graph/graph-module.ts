import type { GraphModuleProps } from "./types";

type GraphModuleInstanceProps = Omit<
	GraphModuleProps,
	"usedBy" | "uses" | "dependencies" | "exported"
>;

export class GraphModule {
	public path: string;
	private originalPath: string;
	private runtime?: string;
	private dependencies = new Map<string, string[]>();
	private exported: string[] = [];
	private usedBy: GraphModule[] = [];
	private uses: GraphModule[] = [];

	constructor(props: GraphModuleInstanceProps) {
		this.path = props.path;
		this.originalPath = props.originalPath;
		this.runtime = props.runtime;
	}

	static create(props: GraphModuleInstanceProps): GraphModule {
		return new GraphModule(props);
	}

	addUsedBy(module: GraphModule) {
		if (!this.usedBy.includes(module)) {
			this.usedBy.push(module);
		}

		if (!module.isUsing(this)) {
			module.addUses(this);
		}
	}

	isUsedBy(module: GraphModule): boolean {
		return this.usedBy.includes(module);
	}

	addUses(module: GraphModule) {
		if (!this.uses.includes(module)) {
			this.uses.push(module);
		}

		if (!module.isUsedBy(this)) {
			module.addUsedBy(this);
		}
	}

	isUsing(module: GraphModule): boolean {
		return this.uses.includes(module);
	}

	toJSON() {
		return {
			path: this.path,
			originalPath: this.originalPath,
			runtime: this.runtime,
			dependencies: Object.fromEntries(this.dependencies),
			exported: this.exported,
			usedBy: this.usedBy,
			uses: this.uses,
		};
	}
}
