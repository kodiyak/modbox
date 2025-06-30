import { defineFetcher } from "../../utils";

export function createDefaultFetcher() {
	return defineFetcher({
		fetch: async ({ url, options, next }, { logger }) => {
			const response = await next();
			logger.debug(`[default] Fetching URL: ${url}`, {
				options,
				response,
			});
			return response || fetch(url, options);
		},
	});
}
