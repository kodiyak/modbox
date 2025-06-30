import { defineResolver } from "../../utils/define-resolver";

export function createMemoryResolver() {
	return defineResolver({
		resolve: ({ path, parent, next }, { logger, registry }) => {
			const module = registry.get("modules").get(path);
			/**
			 * @todo Get module Blob URL by Memory Module
			 * Maybe this is not necessary, since the blob resolver will handle it.
			 */
			// logger.debug("Module found in memory", { path, module });

			return next();
		},
	});
}
