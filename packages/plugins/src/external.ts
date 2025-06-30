import { definePlugin } from "@modbox/utils";

export function external() {
	return definePlugin({
		fetcher: {
			fetch: async ({ url, options, next }, { logger }) => {
				if (url.startsWith("external://")) {
					logger.debug(`[Logger][EXTERNAL] ${url}`, { options });
					return next();
				}

				return next();
			},
		},
		resolver: {
			resolve: ({ path, next }, { fs }) => {
				if (!fs.readFile(path)) {
					return `external://${path}`;
				}
				return next();
			},
		},
	});
}
