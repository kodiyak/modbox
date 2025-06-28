import { type Module, parseSync, type Script } from "@swc/wasm";

export type ParsedModule = Script | Module;

export function swcParser(content: string): ParsedModule | null {
	try {
		const parsed = parseSync(content, {
			syntax: "typescript",
			tsx: true,
			target: "es2022",
		});
		return parsed;
	} catch (error) {
		console.error("Failed to parse content:", error);
		return null;
	}
}
