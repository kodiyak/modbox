import { defineResolver } from "../../utils/define-resolver";

export function createGraphResolver() {
	return defineResolver({
		resolve: ({ path, parent, next }, { logger, registry }) => {
			logger.debug(`Resolving graph for path: ${path} with parent: ${parent}.`);

			return next();
		},
	});
}
