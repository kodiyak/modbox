import { defineResolver } from "../../utils/define-resolver";

export function createExternalResolver() {
	return defineResolver({
		resolve: ({ path, parent, next }, { logger, fs, registry }) => {},
	});
}
