import { defineResolver } from "../../utils/define-resolver";

export function createCacheResolver() {
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
		) => {},
	});
}
