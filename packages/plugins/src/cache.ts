import { definePlugin } from "@modbox/utils";

const registry = new Map<string, any>();
export function cache() {
	return definePlugin({
		pipeline: {
			fetcher: {
				fetch: async ({ url, next, logger }) => {
					if (registry.has(url)) {
						const cachedResponse = registry.get(url);
						logger.debug(`[Cache][HIT] ${url}`, { response: cachedResponse });
						return cachedResponse;
					}
					const response = await next();
					if (response) {
						registry.set(url, response);
						logger.debug(`[Cache][MISS] ${url}`, { response });
					}
					return response;
				},
			},
			resolver: { resolve: ({ next }) => next() },
		},
	});
}
