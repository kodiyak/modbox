import type { Logger } from "../../shared";
import type { VirtualFiles } from "../virtual-files";
import { GraphModule } from "./graph-module";
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

	public build() {
		this.cleanup();
		const { files } = this.fs.readdir();
		this.logger.info(
			`[GraphBuilder] Building graph from ${files.length} files...`,
		);

		for (const filePath of files) {
			try {
				this.processFile(filePath);
			} catch (error: any) {
				this.logger.error(
					`[GraphBuilder] Error building graph for ${filePath}:`,
					error,
				);
			}
		}
	}

	private processFile(filePath: string) {
		const content = this.fs.readFile(filePath);
		if (!content) {
			this.logger.warn(`[GraphBuilder] File not found: ${filePath}`);
			return;
		}

		const { exported, dependencies } = this.extractor.processFile(
			filePath,
			content,
		);
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
			this.logger.info(`[GraphBuilder] Module removed: ${path}`);
		} else {
			this.logger.warn(`[GraphBuilder] Module not found for removal: ${path}`);
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
			console.warn(
				`[GraphBuilder] Módulo inicial '${startModuleId}' não encontrado para busca de dependências.`,
			);
			return allDependencies;
		}

		if (path.includes(startModuleId)) {
			console.error(
				`[GraphBuilder] Ciclo de dependência detectado: ${[...path, startModuleId].join(" -> ")}`,
			);
			return allDependencies;
		}

		if (visited.has(startModuleId)) {
			return allDependencies;
		}

		visited.add(startModuleId);
		allDependencies.add(startModuleId);
		path.push(startModuleId);

		for (const [depId, dep] of module.dependencies) {
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
