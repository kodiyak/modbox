import { definePlugin, isUrl } from "@modpack/utils";

interface EsmShOptions {
	registry?: "npm" | "jsr" | "github" | "pr";
}

export function esmSh(options: EsmShOptions = {}) {
	const { registry = "npm" } = options;

	return definePlugin({
		name: "@modpack/plugin-esm.sh",
		pipeline: {
			fetcher: {
				fetch: async ({ url, next }) => {
					if (isUrl(url) && url.includes("esm.sh")) {
						return fetch(url);
					}

					return next();
				},
			},
			resolver: {
				resolve: ({ next, path, parent, logger, fs }) => {
					if (!isUrl(path)) {
						let nextPath = path;
						if (path.startsWith("/")) {
							nextPath = nextPath.slice(1);
						}
						if (path.startsWith("./")) {
							logger.warn(
								`EsmSh resolver does not support relative paths: ${path}`,
							);
							return next();
						}

						const registryUrl = {
							npm: "https://esm.sh",
							jsr: "https://esm.sh/jsr",
							github: "https://esm.sh/gh",
							pr: "https://esm.sh/pr",
						}[registry];

						return next({
							path: [registryUrl, nextPath].join("/"),
							parent,
						});
					}

					return next();
				},
			},
		},
	});
}
