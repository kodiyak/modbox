export class GraphParseError extends Error {
	constructor(message: string, path: string) {
		super(`Failed to parse module at "${path}": ${message}`);
		this.name = "GraphParseError";
	}
}
