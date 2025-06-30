import { defineFetcher } from "../../utils";

export function createDefaultFetcher() {
	return defineFetcher({
		fetch: async ({ url, next }, { logger, registry }) => {
			if (registry.get("responses").has(url)) {
				logger.debug(`Cache hit for URL: ${url}`);
				return registry.get("responses").get(url);
			}
			const response = await next();
			if (!response) return response;

			logger.debug(`Cache miss for URL: ${url}, storing response.`);
			registry.get("responses").register(url, response);

			return response;
		},
	});
}
