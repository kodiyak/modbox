import { definePlugin } from "@modbox/utils";

export function external(options?: { [key: string]: string }) {
	return definePlugin({
		pipeline: {
			fetcher: {
				fetch: async ({ url, options: fetchOptions, next, logger }) => {
					if (url.startsWith("external://")) {
						const nextUrl = new URL(
							url.replace("external://", ""),
							"https://esm.sh",
						);
						logger.debug(
							`[Logger][fetcher][external] [${url} => ${nextUrl.toString()}]`,
							{ options, fetchOptions },
						);
						return fetch(nextUrl.toString(), fetchOptions);
					}

					return next();
				},
			},
			resolver: {
				resolve: ({ path, parent, logger, next, fs }) => {
					if (!fs.readFile(path) || options?.[path]) {
						let url = `external://${path}`;
						if (
							parent.startsWith("external://") &&
							(path.startsWith("./") || path.startsWith("../"))
						) {
							const basePath = parent
								.replace("external://", "")
								.split("/")
								.slice(0, -1)
								.join("/");
							url = `external://${basePath}/${path.replace(/^\.\//, "").replace(/^\.\.\//, "")}`;
						} else {
							url = `external://${path}`;
						}

						logger.debug(`[Logger][resolver][external] [${path} => ${url}]`, {
							parent,
							options,
						});
						return url;
					}

					return next();
				},
			},
		},
	});
}
