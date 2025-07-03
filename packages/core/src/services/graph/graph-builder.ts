import type { Logger } from "../../shared";
import type { VirtualFiles } from "../../shared/virtual-files";
import { GraphModule } from "./graph-module";
import type { ModulesExtractor } from "./modules-extractor";
import type { GraphBuilderOptions } from "./types";

export class GraphBuilder {
	private readonly modules: Map<string, GraphModule>;
	private readonly fs: VirtualFiles;
	// @ts-expect-error: This is a placeholder for the options type, which can be defined later.
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

	public async build() {
		this.cleanup();
		const { files } = this.fs.readdir();
		for (const filePath of files) {
			try {
				this.processFile(filePath);
			} catch (error: any) {
				this.logger.error(`Error building graph for ${filePath}:`, error);
			}
		}
	}

	private processFile(filePath: string) {
		const content = this.fs.readFile(filePath);
		if (!content) {
			// this.logger.warn(`File "${filePath}" not found.`);
			return;
		}

		const extractedDependencies = this.extractor.processFile(filePath, content);
		if (!extractedDependencies) {
			// this.logger.warn(`No dependencies extracted from "${filePath}" file.`);
			return;
		}

		const { exported, dependencies } = extractedDependencies;
		// this.logger.debug(
		// 	`Extracted "${dependencies.length} dependencies" and "${exported.length} exports" from "${filePath}" file.`,
		// 	{ exported, dependencies },
		// );

		this.addOrUpdateModule(
			GraphModule.create({
				path: filePath,
				originalPath: filePath,
				runtime: content,
			})
				.addDependencies(dependencies)
				.addExports(exported),
		);
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
			// this.logger.info(`Module removed: ${path}`);
		} else {
			// this.logger.warn(`Module not found for removal: ${path}`);
		}
	}

	getTransitiveDependencies(
		startModuleId: string,
		visited: Set<string> = new Set(),
		path: string[] = [],
	): Set<string> {
		const allDependencies = new Set<string>();
		const module = this.getModule(startModuleId);

		if (!module) {
			// this.logger.warn(
			// 	`Module with ID "${startModuleId}" not found in the graph.`,
			// );
			return allDependencies;
		}

		if (path.includes(startModuleId)) {
			this.logger.warn(
				`Circular dependency detected for module "${startModuleId}". Path: ${path.join(
					" -> ",
				)}`,
			);
			return allDependencies;
		}

		if (visited.has(startModuleId)) {
			return allDependencies;
		}

		visited.add(startModuleId);
		allDependencies.add(startModuleId);
		path.push(startModuleId);

		for (const [depId] of module.dependencies) {
			if (visited.has(depId)) {
				allDependencies.add(depId);
				continue;
			}
			const subDependencies = this.getTransitiveDependencies(depId, visited, [
				...path,
			]);
			subDependencies.forEach((id) => allDependencies.add(id));
		}

		return allDependencies;
	}

	/**
	 * Verifica a existência de ciclos de dependência em todo o grafo.
	 */
	detectCycles(): string[] | null {
		for (const moduleId of this.modules.keys()) {
			const visited = new Set<string>();
			const recursionStack = new Set<string>();
			const path: string[] = [];

			if (this.dfsDetectCycle(moduleId, visited, recursionStack, path)) {
				return path;
			}
		}
		return null;
	}

	/**
	 * Função auxiliar para a detecção de ciclos usando DFS.
	 */
	private dfsDetectCycle(
		moduleId: string,
		visited: Set<string>,
		recursionStack: Set<string>,
		path: string[],
	): boolean {
		if (recursionStack.has(moduleId)) {
			const cycleStartIndex = path.indexOf(moduleId);
			const cyclePath = path.slice(cycleStartIndex);
			cyclePath.push(moduleId);
			path.splice(0, path.length, ...cyclePath);
			return true;
		}

		if (visited.has(moduleId)) {
			return false;
		}

		visited.add(moduleId);
		recursionStack.add(moduleId);
		path.push(moduleId);

		const module = this.getModule(moduleId);
		if (module) {
			for (const [depId] of module.dependencies) {
				if (this.dfsDetectCycle(depId, visited, recursionStack, path)) {
					return true;
				}
			}
		}

		path.pop();
		recursionStack.delete(moduleId);
		return false;
	}
}
