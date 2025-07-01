import type { ModuleGraph } from "../types";
import { AbstractBundlerRegistry } from "./bundler-registry";

export class GraphRegistry extends AbstractBundlerRegistry<
	ModuleGraph,
	ModuleGraph
> {
	// @ts-expect-error: This is a placeholder for the type, which can be defined later.
	protected buildRegistry(key: string, item: ModuleGraph): ModuleGraph {
		return item;
	}
}
