import { definePlugin, isUrl } from "@modpack/utils";

interface EsmShOptions {
	registry?: "npm" | "jsr" | "github" | "pr";
	external?: string[];
}

export function esmSh(options: EsmShOptions = {}) {
	const { registry = "npm", external = [] } = options;

	return definePlugin({
		name: "@modpack/plugin-esm.sh",
		pipeline: {
			resolver: {
				resolve: ({ next, path: currentPath, parent }) => {
					let path = currentPath;
					const versionQueryParam = path.match(/\?v=\d+$/);
					if (versionQueryParam) {
						return next();
					}

					if (!isUrl(path)) {
						if (path.startsWith("/")) {
							path = path.slice(1);
						}
						if (path.startsWith("./")) {
							return next();
						}

						if (external.includes(path)) {
							return next();
						}

						const registryUrl = {
							npm: "https://esm.sh",
							jsr: "https://esm.sh/jsr",
							github: "https://esm.sh/gh",
							pr: "https://esm.sh/pr",
						}[registry];

						const url = new URL(path, registryUrl);
						if (external.length > 0) {
							url.searchParams.set("external", external.join(","));
						}

						return next({
							path: url.toString(),
							parent,
						});
					}

					return next();
				},
			},
		},
	});
}
