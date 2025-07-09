import { definePlugin, isUrl } from "@modpack/utils";

export function virtual() {
	return definePlugin({
		name: "@modpack/plugin-virtual",
		pipeline: {
			fetcher: {
				fetch: async ({ url, next, fs }) => {
					if (isUrl(url) && url.startsWith("file://")) {
						const filePath = url.replace("file://", "");
						if (fs.readFile(filePath)) {
							const content = fs.readFile(filePath)!;
							return new Response(content, {
								headers: {
									"Content-Type": "application/javascript",
									"Content-Length": content.length.toString(),
								},
							});
						}
					}

					return next();
				},
			},
		},
	});
}
