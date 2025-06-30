import { defineFetcher } from "../../utils";

export function createCacheFetcher() {
	return defineFetcher({
		fetch: async ({ url, next }, { logger, registry }) => {
			if (registry.get("responses").has(url)) {
				const cachedResponse = registry.get("responses").get(url);
				logger.debug(`[Cache][HIT] ${url}`, { response: cachedResponse });
				return registry.get("responses").get(url);
			}
			const response = await next();
			if (response) registry.get("responses").register(url, response);

			logger.debug(`[Cache][MISS] ${url}`, { response });

			return response;
		},
	});
}
