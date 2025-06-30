import { defineResolver } from "../../utils/define-resolver";

export function createVirtualResolver() {
	return defineResolver({
		resolve: ({ path, next }, { fs }) => {
			if (fs.readFile(path)) {
				return `virtual-file://${path}`;
			}

			return next();
		},
	});
}
