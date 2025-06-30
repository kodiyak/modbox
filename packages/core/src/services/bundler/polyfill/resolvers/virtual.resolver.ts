import { defineResolver } from "../../utils/define-resolver";

export function createVirtualResolver() {
	return defineResolver({
		resolve: ({ path, next }, { fs, registry, logger }) => {
			const content = fs.readFile(path);
			if (content) {
				const url = `virtual-file://${path}`;
				const blobURL = registry.get("blobs").get(url);
				if (blobURL) return blobURL;

				return url;
			}

			return next();
		},
	});
}
