import { defineFetcher } from "../../utils";

export function createVirtualFetcher() {
	return defineFetcher({
		fetch: async ({ url, next }, { logger, fs }) => {
			if (url.startsWith("virtual-file://")) {
				const path = url.replace("virtual-file://", "");
				logger.debug(`Fetching virtual file: ${path}`);
				const content = fs.readFile(path);
				if (content) {
					return new Response(content, {
						headers: { "Content-Type": "application/javascript" },
					});
				} else {
					logger.warn(`Virtual file not found: ${path}`);
					return new Response(null, { status: 404 });
				}
			}

			return next();
		},
	});
}
