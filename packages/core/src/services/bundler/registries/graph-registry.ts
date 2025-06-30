import type { ModuleGraph } from "../types";
import { AbstractBundlerRegistry } from "./bundler-registry";

export class GraphRegistry extends AbstractBundlerRegistry<
	ModuleGraph,
	ModuleGraph
> {
	protected buildRegistry(key: string, item: ModuleGraph): ModuleGraph {
		return item;
	}
}
