import { definePlugin, isUrl } from "@modpack/utils";

export function virtual() {
	return definePlugin({
		name: "@modpack/plugin-virtual",
		pipeline: {
			sourcer: {
				source: async ({ url, next, fs }) => {
					if (isUrl(url) && url.startsWith("file://")) {
						const filePath = url.replace("file://", "");
						if (fs.readFile(filePath)) {
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
