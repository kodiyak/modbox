import { defineFetcher } from "../../utils";

export function createVirtualFetcher() {
	return defineFetcher({
		fetch: async ({ url, next }, { logger, fs, registry }) => {
			if (url.startsWith("virtual-file://")) {
				const path = url.replace("virtual-file://", "");
				const content = fs.readFile(path);
				if (content) {
					logger.debug(`[Virtual][HIT] ${path}`, { content });
					const virtualFile = new Response(content, {
						headers: { "Content-Type": "application/javascript" },
					});
					registry.get("responses").register(url, virtualFile);
					return virtualFile;
				} else {
					logger.warn(`[Virtual][MISS] ${path}`);
					return new Response(null, { status: 404 });
				}
			}

			return next();
		},
	});
}
