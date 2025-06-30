import { definePlugin } from "@modbox/utils";

export function logger() {
	return definePlugin({
		pipeline: {
			fetcher: {
				fetch: async ({ url, options, next }, { logger }) => {
					logger.debug(`[Logger][FETCH] ${url}`, { options });
					const response = await next();
					logger.debug(`[Logger][RESPONSE] ${url}`, { response });
					return response;
				},
			},
			resolver: {
				resolve: ({ next, path, parent }, { logger }) => {
					logger.debug(`[Logger][RESOLVER] Resolving module: ${path}`, {
						parent,
					});
					const response = next();
					logger.debug(
						`[Logger][RESOLVER] Resolved module: [${path} => ${response}]`,
						{ parent },
					);

					return response;
				},
			},
		},
		analyze: {
			process: (props, { logger, dependenciesRegistry, exportsRegistry }) => {
				logger.debug(`[Logger][ANALYZE] Processing module: ${props.path}`, {
					...props,
					dependencies: dependenciesRegistry.getAll(),
					exported: exportsRegistry.getAll(),
				});
			},
		},
	});
}
