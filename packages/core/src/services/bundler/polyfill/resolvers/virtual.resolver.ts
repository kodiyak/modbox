import { defineResolver } from "../../utils/define-resolver";

export function createVirtualResolver() {
	return defineResolver({
		resolve: ({ path, parent, next }, { logger, fs }) => {
			if (fs.readFile(path)) {
				logger.debug(
					`Resolving virtual for path: ${path} with parent: ${parent}.`,
					fs.readFile(path),
				);
				return `virtual-file://${path}`;
			}

			logger.debug(
				`No virtual file found for path: ${path} with parent: ${parent}.`,
			);

			return next();
		},
	});
}
