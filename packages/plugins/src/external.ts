import { definePlugin } from "@modbox/utils";

export function external(options?: { [key: string]: string }) {
	return definePlugin({
		pipeline: {
			fetcher: {
				fetch: async ({ url, options: fetchOptions, next, logger }) => {
					if (url.startsWith("external://")) {
						logger.debug(`[Logger][EXTERNAL] ${url}`, {
							options,
							fetchOptions,
						});
						return next();
					}

					return next();
				},
			},
			resolver: {
				resolve: ({ path, next, fs }) => {
					if (!fs.readFile(path) || options?.[path]) {
						return `external://${path}`;
					}
					return next();
				},
			},
		},
	});
}
