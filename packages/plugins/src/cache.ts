import { definePlugin } from "@modpack/utils";

export function cache() {
	const registry = new Map<string, any>();
	return definePlugin({
		name: "@modpack/plugin-cache",
		pipeline: {
			fetcher: {
				fetch: async ({ url, next, logger }) => {
					if (registry.has(url)) {
						const cachedResponse = registry.get(url);
						logger.debug(`[HIT] ${url}`, { response: cachedResponse });
						return cachedResponse;
					}
					const response = await next();
					if (response) {
						registry.set(url, response);
						logger.debug(`[MISS] ${url}`, { response });
					}
					return response;
				},
			},
			resolver: { resolve: ({ next }) => next() },
		},
	});
}
