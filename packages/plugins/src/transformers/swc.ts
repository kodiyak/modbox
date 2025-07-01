import { definePlugin } from "@modbox/utils";
import { type Options, transformSync } from "@swc/wasm-web";

interface SwcOptions extends Options {
	extensions?: string[];
}

export function swc(options: SwcOptions = {}) {
	return definePlugin({
		pipeline: {
			transformer: {
				transform: async ({ source, url, next, logger }) => {
					const { extensions = [".ts", ".tsx", ".js", ".jsx"], ...swcOptions } =
						options;

					if (!extensions.some((ext) => url.endsWith(ext))) {
						return next({ source, url });
					}

					logger.debug(`[swc] Transforming ${url}...`, {
						source,
						extensions,
						swcOptions,
					});
					try {
						return next({
							source: transformSync(source, swcOptions).code,
							url,
						});
					} catch (error) {
						logger.error(`[swc] Error transforming source`, {
							source,
							extensions,
							error,
						});
						return next({ source, url }); // Fallback to original source on error
					}
				},
			},
		},
	});
}
