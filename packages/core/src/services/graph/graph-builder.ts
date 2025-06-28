import type { Logger } from "../../shared";
import type { VirtualFiles } from "../virtual-files";
import type { GraphModule } from "./graph-module";
import type { ModulesExtractor } from "./modules-extractor";
import type { GraphBuilderOptions } from "./types";

export class GraphBuilder {
	private readonly modules: Map<string, GraphModule>;
	private readonly fs: VirtualFiles;
	private readonly options: GraphBuilderOptions;
	private readonly logger: Logger;
	private readonly extractor: ModulesExtractor;

	constructor(
		logger: Logger,
		fs: VirtualFiles,
		extractor: ModulesExtractor,
		options: GraphBuilderOptions,
	) {
		this.modules = new Map<string, GraphModule>();
		this.fs = fs;
		this.options = options;
		this.logger = logger;
		this.extractor = extractor;
	}

	public addOrUpdateModule(module: GraphModule): void {
		this.modules.set(module.path, module);
	}

	public getModule(path: string): GraphModule | undefined {
		return this.modules.get(path);
	}

	public getModules(): GraphModule[] {
		return Array.from(this.modules.values());
	}

	public cleanup(): void {
		this.modules.clear();
	}

	public removeModule(path: string): void {
		if (this.modules.has(path)) {
			this.modules.delete(path);
			this.logger.info(`[GraphBuilder] Module removed: ${path}`);
		} else {
			this.logger.warn(`[GraphBuilder] Module not found for removal: ${path}`);
		}
	}
}
