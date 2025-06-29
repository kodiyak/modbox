import type { Logger } from "../../shared";
import type { VirtualFiles } from "../../shared/virtual-files";
import type { TranspileHandlers } from "./transpiler-handlers";
import type { TranspileCodeResult, TranspileResult } from "./types";

export class Transpiler {
	private readonly handlers: TranspileHandlers;
	private readonly logger: Logger;
	private readonly fs: VirtualFiles;

	constructor(logger: Logger, handlers: TranspileHandlers, fs: VirtualFiles) {
		this.handlers = handlers;
		this.logger = logger;
		this.fs = fs;
	}

	async transpile(): Promise<TranspileResult> {
		const { files } = this.fs.readdir();
		const result: TranspileResult = {
			codes: {},
			warnings: [],
		};
		this.logger.info(`Transpiling ${files.length} files...`);

		for (const filePath of files) {
			try {
				const code = this.fs.readFile(filePath);
				if (!code) {
					result.warnings.push(`No code found for ${filePath}`);
					continue;
				}

				const transpiled = await this.transpileCode(filePath, code);
				if (transpiled) {
					result.codes[filePath] = transpiled;
				} else {
					result.warnings.push(`Failed to transpile ${filePath}`);
				}
			} catch (error) {
				result.warnings.push(`Error transpiling ${filePath}: ${error}`);
			}
		}

		if (result.warnings.length > 0) {
			this.logger.warn(
				`Warnings encountered during transpilation:`,
				result.warnings,
			);
		}

		return result;
	}

	async transpileCode(
		filePath: string,
		code: string,
		options?: any,
	): Promise<TranspileCodeResult | null> {
		const kind = this.handlers.identifyModuleKind(filePath, code);
		const transpilerFn = this.handlers.getTranspiler(kind);

		if (!transpilerFn) {
			return null;
		}

		try {
			return {
				...(await transpilerFn(code, filePath, options)),
				kind,
			};
		} catch (error) {
			this.logger.error(
				`Error transpiling ${filePath} with kind ${kind}:`,
				error,
			);
			return null;
		}
	}
}
