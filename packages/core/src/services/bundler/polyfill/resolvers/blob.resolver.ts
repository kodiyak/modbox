import { defineResolver } from "../../utils/define-resolver";

export function createBlobResolver() {
	return defineResolver({
		resolve: ({ path, parent, next }, { logger, registry }) => {
			logger.debug("Resolving blob url", { path, parent });

			const blobURL = registry.get("blobs").get(path);
			if (blobURL) {
				return blobURL;
			}

			return next();
		},
	});
}
