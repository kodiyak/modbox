import { definePlugin } from "@modpack/utils";

export function logger() {
	return definePlugin({
		name: "@modpack/plugin-logger",
		pipeline: {
			fetcher: {
				fetch: async ({ url, options, next, logger }) => {
					logger.debug(`[fetch][dispatch] [${url}]`, { options });
					const response = await next();
					logger.debug(`[fetch][response] [${url}]`, { response });
					return response;
				},
			},
			resolver: {
				resolve: ({ next, path, parent, logger }) => {
					logger.debug(`[resolve][dispatch] [${path}]`, {
						parent,
					});
					const response = next();
					logger.debug(`[resolve][response] [${path} => ${response}]`, {
						parent,
					});

					return response;
				},
			},
		},
		analyze: {
			process: ({ logger, ...props }) => {
				logger.debug(`[ANALYZE] Processing module: ${props.path}`, props);
			},
		},
	});
}
