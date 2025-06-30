import { defineResolver } from "../../utils/define-resolver";

export function createGraphResolver() {
	return defineResolver({
		resolve: ({ next }) => {
			return next();
		},
	});
}
