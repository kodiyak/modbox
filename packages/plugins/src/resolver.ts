import { definePlugin, isUrl } from "@modpack/utils";
import { removeVersionQueryParam } from "./utils";

export interface ResolverOptions {
	extensions?: string[];
	index?: boolean;
	alias?: Record<string, string | string[]>;
	baseUrl?: string;
}

export function resolver(props?: ResolverOptions) {
	const { extensions, index, alias, baseUrl } = {
		extensions: [".js", ".json", ".mjs", ".cjs", ".ts", ".jsx", ".tsx"],
		index: true,
		alias: {},
		baseUrl: "/",
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

					path = removeVersionQueryParam(path);
					const potentialPaths = new Set<string>();

					potentialPaths.add(resolveFromBaseUrl(path, baseUrl));
					[...resolveFromAlias(path, alias)].forEach((resolvedPath) => {
						potentialPaths.add(resolvedPath);
						potentialPaths.add(resolveFromBaseUrl(resolvedPath, baseUrl));
					});

					if (
						path.startsWith("./") ||
						path.startsWith("../") ||
						path === ".."
					) {
						if (!parent) return next({ path, parent });
						path = resolveRelativePath(parent, path);
						if (path === "/") path = "";
					}

					const hasKnownExtension = extensions.some((ext) =>
						path.endsWith(ext),
					);

					if (hasKnownExtension) {
						potentialPaths.add(path);
					}

					if (resolveIndex) {
						potentialPaths.add(`${[path, "index"].join("/")}`);
					}

					for (const ext of extensions) {
						for (const candidatePath of potentialPaths) {
							if (candidatePath.endsWith(ext)) continue;
							potentialPaths.add(`${candidatePath}${ext}`);
						}
						potentialPaths.add(`${path}${ext}`);
					}

					console.log(`Searching for: ${path} in ${potentialPaths.size} paths`);
					for (const candidatePath of potentialPaths) {
						// console.warn(`Searching for [${path} => ${candidatePath}]`);
						try {
							if (fs.readFile(candidatePath)) {
								logger.debug?.(`Resolved: ${candidatePath}`);
								return next({ path: `file://${candidatePath}`, parent });
							} else {
								// console.warn(`File not found: ${candidatePath}`);
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

function resolveFromAlias(
	path: string,
	alias: NonNullable<ResolverOptions["alias"]>,
): string[] {
	const potentialPaths = new Set<string>();

	for (const [aliasKey, aliasValues] of Object.entries(alias)) {
		const values = Array.isArray(aliasValues) ? aliasValues : [aliasValues];

		if (aliasKey.includes("*")) {
			const escapedKey = aliasKey
				.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
				.replace("\\*", "(.*)");
			const regex = new RegExp(`^${escapedKey}$`);

			const match = path.match(regex);
			if (match) {
				const wildcardMatch = match[1] ?? "";

				for (const value of values) {
					if (value.includes("*")) {
						potentialPaths.add(value.replace("*", wildcardMatch));
					}
				}
			}
		} else if (path.startsWith(aliasKey)) {
			const suffix = path.slice(aliasKey.length);
			for (const value of values) {
				potentialPaths.add(value + suffix);
			}
		}
	}

	return Array.from(potentialPaths);
}

function resolveFromBaseUrl(path: string, baseUrl: string): string {
	if (!baseUrl) return path;

	if (baseUrl.endsWith("/")) {
		return `${baseUrl}${path}`;
	} else if (baseUrl === "/") {
		return `/${path}`;
	} else {
		return `${baseUrl}/${path}`;
	}
}

function resolveRelativePath(base: string, relative: string): string {
	const baseParts = new URL(base, "file://").pathname.split("/").slice(0, -1);
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

	const output = `/${baseParts.join("/").split("/").filter(Boolean).join("/")}`;
	return output;
}
