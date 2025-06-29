import type { ModuleGraph } from "../types";
import { BundlerRegistry } from "./blundler-registry";

export class GraphRegistry extends BundlerRegistry<ModuleGraph, ModuleGraph> {
	protected buildRegistry(key: string, item: ModuleGraph): ModuleGraph {
		return item;
	}
}
