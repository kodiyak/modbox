import { defineResolver } from "../utils/define-resolver";

export function createMemoryResolver() {
	return defineResolver({
		resolve: async (specifier, parentUrl, resolve) => {},
	});
}
