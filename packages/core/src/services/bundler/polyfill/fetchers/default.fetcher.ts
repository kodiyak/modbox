import { defineFetcher } from "../../utils";

export function createDefaultFetcher() {
	return defineFetcher({
		fetch: async ({ url, options, next }, { logger }) => {
			const response = await next();
			return response || fetch(url, options);
		},
	});
}
