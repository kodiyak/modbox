import { definePlugin, isUrl } from "@modpack/utils";

export function http() {
	return definePlugin({
		name: "@modpack/plugin-http",
		pipeline: {
			fetcher: {
				fetch: async ({ url, next, options }) => {
					if (
						isUrl(url) &&
						(url.startsWith("http://") || url.startsWith("https://"))
					) {
						return fetch(url);
					}

					return next({ url, options });
				},
			},
		},
	});
}
