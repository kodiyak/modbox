import type { GraphExported } from "../types";

export class ExportsRegistry {
	private readonly exports = new Map<string, GraphExported>();

	addExported(exported: Omit<GraphExported, "type">) {
		if (this.exports.has(exported.name)) {
			return;
		}
		this.exports.set(exported.name, {
			type: "exported",
			...exported,
		});
	}
}
