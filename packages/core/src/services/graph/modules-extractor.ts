import type { ModuleItem } from "@swc/wasm-web";
import type { Logger } from "../../shared";
import { DependenciesRegistry, ExportsRegistry } from "./registries";
import type { ModuleExtractorHandler } from "./types";
import { initSwc, swcParser } from "./utils";

export class ModulesExtractor {
	private readonly handlers: ModuleExtractorHandler[] = [];
	private readonly logger: Logger;

	private isInitialized = false;

	constructor(logger: Logger, handlers: ModuleExtractorHandler[] = []) {
		this.handlers = handlers;
		this.logger = logger;
	}

	async preload() {
		if (this.isInitialized) {
			return;
		}
		this.isInitialized = true;
		await initSwc();
	}

	processFile(path: string, content: string) {
		const parsedContent = swcParser(content);
		if (!parsedContent) {
			// this.logger.warn(`[ModulesExtractor] Failed to parse file: ${path}`);
			return;
		}

		const { body: nodes } = parsedContent;
		const exports = ExportsRegistry.create();
		const dependencies = DependenciesRegistry.create();
		const dir = path.split("/").slice(0, -1).join("/");
		const warnings: string[] = [];

		for (const handler of this.handlers) {
			for (const item of nodes) {
				try {
					handler({
						node: item,
						dir,
						path,
						isType: this.isType.bind(this),
						logger: this.logger,
						exports,
						dependencies,
					});
				} catch (error) {
					warnings.push(
						`[ModulesExtractor] Error processing node of type "${item.type}" in file "${path}": ${error}`,
					);
				}
			}
		}

		return {
			exported: exports.getAll(),
			dependencies: dependencies.getAll(),
			warnings,
		};
	}

	private isType<T extends ModuleItem["type"]>(
		node: any,
		type: T,
	): node is Extract<ModuleItem, { type: T }> {
		return node.type === type;
	}
}
