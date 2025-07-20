import { definePlugin, isUrl } from "@modpack/utils";

export interface EsmShOptions {
	registry?: "npm" | "jsr" | "github" | "pr";
	external?: string[];
}

export function esmSh(options: EsmShOptions = {}) {
	const { registry = "npm", external = [] } = options;
	const registryBase = {
		npm: "https://esm.sh",
		jsr: "https://esm.sh/jsr/",
		github: "https://esm.sh/gh/",
		pr: "https://esm.sh/pr/",
	}[registry];

	return definePlugin({
		name: "@modpack/plugin-esm.sh",
		pipeline: {
			resolver: {
				fallback: true,
				resolve: ({ next, path: currentPath, parent }) => {
					const result = next();
					if (result && isUrl(result)) return result;
					let path = result || currentPath;

					if (path.startsWith("./") || path.startsWith("../")) {
						if (parent && isUrl(parent)) {
							const parentUrl = new URL(parent);
							const stack = parentUrl.pathname.split("/").slice(0, -1);
							const parts = path.split("/");
							for (const segmentKey in parts) {
								const segment = parts[segmentKey];
								if (segment === "..") {
									stack.pop();
									parts[segmentKey] = "";
								}
							}

							const finalPath = [...stack, ...parts].filter(Boolean).join("/");
							const resolved = new URL(finalPath, `${registryBase}`);

							if (external.length > 0) {
								resolved.searchParams.set("external", external.join(","));
							}

							return next({
								path: resolved.toString(),
								parent,
							});
						}
					}

					path = path.replace(/^\/+/, "");

					const url = new URL(path, registryBase);
					if (external.length > 0) {
						url.searchParams.set("external", external.join(","));
					}

					return next({
						path: url.toString(),
						parent,
					});
				},
			},
		},
	});
}
