import { defineResolver } from "../../utils/define-resolver";

export function createGraphResolver() {
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
			logger.debug(`Resolving graph for path: ${path} with parent: ${parent}.`);

			return "";
		},
	});
}
