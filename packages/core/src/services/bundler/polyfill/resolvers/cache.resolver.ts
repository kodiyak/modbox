import { defineResolver } from "../../utils/define-resolver";

export function createCacheResolver() {
	return defineResolver({
		resolve: ({ next }) => {
			// Cache requires a fetch-only middleware.
			return next();
		},
	});
}
