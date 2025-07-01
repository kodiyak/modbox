import { definePlugin } from "@modpack/utils";

export function virtual() {
	return definePlugin({
		pipeline: {
			fetcher: {
				fetch: async ({ url, next, fs }) => {
					if (url.startsWith("virtual-file://")) {
						const path = url.replace("virtual-file://", "");
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

					return next();
				},
			},
			resolver: {
				resolve: ({ path, next, fs, logger }) => {
					const content = fs.readFile(path);
					if (content) {
						return next({ path: `virtual-file://${path}` });
					}
					return next();
				},
			},
		},
	});
}
