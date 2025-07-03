import { definePlugin, isUrl } from "@modpack/utils";

export function virtual() {
	return definePlugin({
		name: "@modpack/plugin-virtual",
		pipeline: {
			sourcer: {
				source: async ({ url, next, logger, fs }) => {
					if (isUrl(url) && url.startsWith("file://")) {
						const filePath = url.replace("file://", "");
						logger.debug(`Virtual FS: ${filePath}`);
						if (fs.readFile(filePath)) {
							logger.debug(`VFS File found at: ${filePath}`);
							return {
								source: fs.readFile(filePath)!,
								type: filePath.split(".").pop()!,
							};
						}
					}

					return next();
				},
			},
		},
	});
}
