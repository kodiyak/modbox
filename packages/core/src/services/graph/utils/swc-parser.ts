import { parseSync } from "@swc/wasm";
import type { SWCModule } from "../types";

export function swcParser(content: string): SWCModule | null {
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
