import { defineResolver } from "../../utils/define-resolver";

export function createExternalResolver() {
	return defineResolver({
		resolve: ({ path, next }, { logger, registry }) => {
			if (registry.get("external").get(path)) {
				return `external://${path}`;
			}

			return next();
		},
	});
}
