import { defineResolver } from "../../utils/define-resolver";

export function createMemoryResolver() {
	return defineResolver({
		resolve: (
			{ path, parent, next },
			{
				logger,
				blobsRegistry,
				graphRegistry,
				modulesRegistry,
				externalRegistry,
			},
		) => {
			logger.debug("Resolving memory", { path, parent });

			const module = modulesRegistry.get(path);
			/**
			 * @todo Get module Blob URL by Memory Module
			 * Maybe this is not necessary, since the blob resolver will handle it.
			 */

			return next();
		},
	});
}
