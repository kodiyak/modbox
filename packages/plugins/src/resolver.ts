import { definePlugin, isUrl } from "@modpack/utils";
import { removeVersionQueryParam } from "./utils";

export interface ResolverOptions {
	extensions?: string[];
	index?: boolean;
	alias?: Record<string, string>;
}

export function resolver(props?: ResolverOptions) {
	const { extensions, index, alias } = {
		extensions: [".js", ".json", ".mjs", ".cjs", ".ts", ".jsx", ".tsx"],
		index: true,
		alias: {},
		...props,
	};
	const resolveIndex = index !== false;
	return definePlugin({
		name: "@modpack/plugin-resolver",
		pipeline: {
			sourcer: {
				source: async ({ url, next, parent, options, logger, fs }) => {
					if (isUrl(url) && url.startsWith("file://")) {
						const path = removeVersionQueryParam(url.replace("file://", ""));
						logger.debug(`Virtual FS: [${url} => ${path} from ${parent}]`);
						if (fs.readFile(path)) {
							logger.debug(`Resolved at: ${path}`);
							return next({
								url: `file://${path}`,
								parent,
								options,
							});
						}
					}

					return next();
				},
			},
			resolver: {
				resolve: ({ next, path: inputPath, parent, fs, logger }) => {
					let path = inputPath;
					if (isUrl(path)) {
						return next();
					}

					// Resolve aliases
					for (const [aliasKey, aliasValue] of Object.entries(alias)) {
						if (path.startsWith(aliasKey)) {
							path = path.replace(aliasKey, aliasValue);
							break;
						}
					}

					path = removeVersionQueryParam(path);

					if (
						path.startsWith("./") ||
						path.startsWith("../") ||
						path === ".."
					) {
						if (!parent) return next({ path, parent });
						path = resolveRelativePath(parent, path);
						if (path === "/") path = "";
					}

					const potentialPaths = new Set<string>();
					const hasKnownExtension = extensions.some((ext) =>
						path.endsWith(ext),
					);

					if (hasKnownExtension) {
						potentialPaths.add(path);
					} else {
						for (const ext of extensions) {
							potentialPaths.add(`${path}${ext}`);
						}
					}

					if (resolveIndex) {
						potentialPaths.add(`${[path, "index"].join("/")}`);
						for (const ext of extensions) {
							potentialPaths.add(
								`${[path, ["index", ext].join("")].join("/")}`,
							);
						}
					}

					for (const candidatePath of potentialPaths) {
						try {
							if (fs.readFile(candidatePath)) {
								logger.debug?.(`Resolved: ${candidatePath}`);
								return next({ path: `file://${candidatePath}`, parent });
							}
						} catch (err) {
							logger.warn?.(`Error reading ${candidatePath}: ${err}`);
						}
					}

					// Fallback to next resolver
					return next();
				},
			},
		},
	});
}

function resolveRelativePath(base: string, relative: string): string {
	const baseParts = base.split("/").slice(0, -1);
	const relativeParts = relative.split("/");

	if (relative === "..") baseParts.pop();

	for (const part of relativeParts) {
		if (part === "." || part === "") continue;
		if (part === "..") {
			baseParts.pop();
		} else {
			baseParts.push(part);
		}
	}

	const output = `${baseParts.join("/").split("/").filter(Boolean).join("/")}`;
	return `/${output.split("/").filter(Boolean).join("/")}`;
}
