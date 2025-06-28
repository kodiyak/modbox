import { swcTsxTranspiler, swcTypeScriptTranspiler } from "./swc-transpiler";
import type { ModuleKind, TranspilerFunction } from "./types";

export class TranspilerRegistry {
	private readonly transpilers = new Map<ModuleKind, TranspilerFunction>();
	private readonly fileExtensionToKind = new Map<string, ModuleKind>();

	constructor() {
		this.registerDefaults();
	}

	registerTranspiler(kind: ModuleKind, transpiler: TranspilerFunction): void {
		if (this.transpilers.has(kind)) {
			console.warn(
				`[TranspilerRegistry] Transpiler for kind "${kind}" already registered. Overwriting.`,
			);
		}
		this.transpilers.set(kind, transpiler);
	}

	registerFileExtension(extension: string, kind: ModuleKind): void {
		this.fileExtensionToKind.set(extension, kind);
	}

	private registerDefaults(): void {
		this.registerTranspiler("typescript", swcTypeScriptTranspiler);
		this.registerTranspiler("tsx", swcTsxTranspiler);
		this.registerTranspiler("javascript", swcTypeScriptTranspiler);
		this.registerTranspiler("jsx", swcTsxTranspiler);

		this.registerFileExtension(".ts", "typescript");
		this.registerFileExtension(".tsx", "tsx");
		this.registerFileExtension(".js", "javascript");
		this.registerFileExtension(".jsx", "jsx");
		this.registerFileExtension(".mjs", "javascript");
		this.registerFileExtension(".cjs", "javascript");
	}

	identifyModuleKind(filePath: string, code?: string): ModuleKind {
		const parts = filePath.split(".");
		const extension = parts[parts.length - 1]?.toLowerCase();

		if (extension && this.fileExtensionToKind.has(`.${extension}`)) {
			return this.fileExtensionToKind.get(`.${extension}`)!;
		}

		if (code) {
			if (
				(extension === "js" || extension === "ts") &&
				(code.includes("React.createElement") ||
					code.includes("import React from") ||
					code.trim().startsWith("<"))
			) {
				return extension === "ts" ? "tsx" : "jsx";
			}

			if (
				!extension &&
				(code.startsWith("{") || code.startsWith("[")) &&
				code.endsWith("}")
			) {
				try {
					JSON.parse(code);
					return "json";
				} catch {}
			}
		}

		if (extension === "js" || extension === "mjs" || extension === "cjs")
			return "javascript";
		if (extension === "ts") return "typescript";
		if (extension === "jsx") return "jsx";
		if (extension === "tsx") return "tsx";
		if (extension === "json") return "json";
		if (extension === "css") return "css";

		return "binary";
	}

	getTranspiler(kind: ModuleKind): TranspilerFunction | undefined {
		return this.transpilers.get(kind);
	}
}
