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

					logger.debug(
						`[swc] Transforming source with options: ${JSON.stringify(swcOptions)}`,
						{
							source,
							extensions,
						},
					);

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
						return source; // Fallback to original source on error
					}
				},
			},
		},
	});
}
