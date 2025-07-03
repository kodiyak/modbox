import { definePlugin, isUrl } from "@modpack/utils";
import { type Options, transformSync } from "@swc/wasm-web";

interface SwcOptions extends Options {
	extensions?: string[];
}

export function swc(options: SwcOptions = {}) {
	const { extensions = [".ts", ".tsx", ".js", ".jsx"], ...swcOptions } =
		options;
	return definePlugin({
		name: "swc",
		pipeline: {
			sourcer: {
				source: async ({ url, next, logger, fs }) => {
					if (
						isUrl(url) &&
						url.startsWith("file://") &&
						extensions.some((ext) => url.endsWith(ext))
					) {
						const filePath = url.replace("file://", "");
						const content = fs.readFile(filePath);
						if (content) {
							logger.debug(`File found at: ${filePath}`);
							return {
								source: transformSync(content, swcOptions).code,
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
