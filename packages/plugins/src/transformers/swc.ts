import { definePlugin, isUrl } from "@modpack/utils";
import { type Options, transformSync } from "@swc/wasm-web";
import { removeVersionQueryParam } from "../utils";

interface SwcOptions extends Options {
	extensions?: string[];
}

export function swc(options: SwcOptions = {}) {
	const { extensions = [".ts", ".tsx", ".js", ".jsx"], ...swcOptions } =
		options;
	return definePlugin({
		name: "@modpack/plugin-swc",
		onMount: async (props) => {
			console.warn(
				"@modpack/plugin-swc is deprecated. Please use @modpack/plugin-transformers instead.",
				props,
			);
		},
		pipeline: {
			sourcer: {
				source: async ({ url: currentUrl, next, fs }) => {
					const url = removeVersionQueryParam(currentUrl);
					if (
						isUrl(url) &&
						url.startsWith("file://") &&
						extensions.some((ext) => url.endsWith(ext))
					) {
						const filePath = url.replace("file://", "");
						const content = fs.readFile(filePath);
						if (content) {
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
