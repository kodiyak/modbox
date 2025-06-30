import { definePlugin } from "@modbox/utils";

export function logger() {
	return definePlugin({
		fetcher: {
			fetch: async ({ url, options, next }, { logger }) => {
				logger.debug(`[Logger][FETCH] ${url}`, { options });
				const response = await next();
				logger.debug(`[Logger][RESPONSE] ${url}`, { response });
				return response;
			},
		},
		resolver: { resolve: ({ next }) => next() },
	});
}
