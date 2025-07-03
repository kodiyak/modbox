import { definePlugin, isUrl } from "@modpack/utils";

export function virtual() {
	return definePlugin({
		name: "@modpack/plugin-virtual",
		pipeline: {
			sourcer: {
				source: async ({ url, next, logger, fs }) => {
					if (isUrl(url) && url.startsWith("file://")) {
						const filePath = url.replace("file://", "");
						if (fs.readFile(filePath)) {
							logger.debug(`File found at: ${filePath}`);
							return {
								source: fs.readFile(filePath)!,
								type: filePath.split(".").pop()!,
							};
						}
					}

					return next();
				},
			},
			fetcher: {
				fetch: async ({ url, next, logger, fs }) => {
					let path = url;
					if (isUrl(url)) {
						if (url.startsWith("file://")) {
							path = url.replace("file://", "");
						}
					} else {
						// If the URL is not a valid URL, treat it as a file path
						if (!path.startsWith("/")) {
							path = `/${path}`;
						}
					}

					logger.debug(
						`Virtual FS: ${path}`,
						fs.readFile(path) ? "exists" : "not found",
					);

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
						return next();
					}
				},
			},
		},
	});
}
