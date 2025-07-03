import { definePlugin } from "@modpack/utils";

export function virtual() {
	return definePlugin({
		name: "@modpack/plugin-virtual",
		pipeline: {
			fetcher: {
				fetch: async ({ url, options, next, fs }) => {
					if (url.startsWith("file://")) {
						const path = url.replace("file://", "");
						const content = fs.readFile(path);
						if (content) {
							const virtualFile = new Response(content, {
								headers: {
									"Content-Type": "application/javascript",
									"Content-Length": content.length.toString(),
								},
							});
							return virtualFile;
						} else {
							return new Response(null, { status: 404 });
						}
					}

					return next({ url, options });
				},
			},
			resolver: {
				resolve: ({ path, parent, next, fs }) => {
					const content = fs.readFile(path);
					if (content) {
						return `file://${path}`;
					}
					return next({ path, parent });
				},
			},
		},
	});
}
