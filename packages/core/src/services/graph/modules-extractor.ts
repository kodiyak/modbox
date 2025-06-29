import type { ModuleItem } from "@swc/wasm";
import type { Logger } from "../../shared";
import type { VirtualFiles } from "../virtual-files";
import type {
	ModuleExtractorHandler,
	ModuleExtractorHandlerResult,
} from "./types";
import { swcParser } from "./utils";

export class ModulesExtractor {
	private readonly handlers: ModuleExtractorHandler[] = [];
	private readonly fs: VirtualFiles;
	private readonly logger: Logger;

	constructor(
		logger: Logger,
		fs: VirtualFiles,
		handlers: ModuleExtractorHandler[] = [],
	) {
		this.fs = fs;
		this.handlers = handlers;
		this.logger = logger;
	}

	processFile(path: string, content: string) {
		const dir = path.split("/").slice(0, -1).join("/");
		const output: ModuleExtractorHandlerResult = {
			dependencies: [],
			exported: [],
			warnings: [],
		};
		for (const handler of this.handlers) {
			const node = swcParser(content);
			if (!node) {
				this.logger.warn(`[ModulesExtractor] Failed to parse file: ${path}`);
				continue;
			}

			for (const item of node.body) {
				const result = handler(
					{ node: item, dir, path },
					{ isType: this.isType.bind(this) },
				);
				if (result) {
					output.dependencies.push(...result.dependencies);
					output.exported.push(...result.exported);
					if (result.warnings) {
						output.warnings?.push(...result.warnings);
					}
				}
			}
		}

		return output;
	}

	private isType<T extends ModuleItem["type"]>(
		node: any,
		type: T,
	): node is Extract<ModuleItem, { type: T }> {
		return node.type === type;
	}
}
