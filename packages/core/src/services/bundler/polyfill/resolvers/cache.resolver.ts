import { defineResolver } from "../../utils/define-resolver";

export const createCacheResolver = ({}: {}) => {
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
};
