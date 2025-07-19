import { definePlugin, isUrl } from "@modpack/utils";

/**
 * @deprecated The `resolver` plugin will handle virtual files instead.
 *
 * Defines a virtual plugin for the Modpack system that intercepts file URLs (starting with "file://")
 * and serves their contents as JavaScript responses. If the URL is not a file URL, or the file cannot
 * be read, the request is passed to the next handler in the pipeline.
 *
 * @returns The virtual plugin definition for Modpack.
 */
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
