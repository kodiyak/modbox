import { defineResolver } from "../../utils/define-resolver";

export function createMemoryResolver() {
	return defineResolver({
		resolve: ({ next }) => {
			return next();
		},
	});
}
