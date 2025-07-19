import { definePlugin, isUrl } from "@modpack/utils";
import { removeVersionQueryParam } from "./utils";

export interface ResolverOptions {
	extensions?: string[];
	index?: boolean;
	alias?: Record<string, string | string[]>;
	baseUrl?: string;
}

const contentTypes = {
	js: "application/javascript" as const,
	json: "application/json" as const,
	mjs: "application/javascript" as const,
	cjs: "application/javascript" as const,
	ts: "application/javascript" as const,
	jsx: "application/javascript" as const,
	tsx: "application/javascript" as const,
};

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
			fetcher: {
				fetch: async ({ url, next, options, fs }) => {
					if (isUrl(url) && url.startsWith("file://")) {
						const filePath = removeVersionQueryParam(
							url.replace("file://", ""),
						);
						const content = fs.readFile(filePath);
						if (content) {
							const ext = filePath
								.split(".")
								.pop() as keyof typeof contentTypes;
							const contentType = contentTypes[ext];
							return new Response(content, {
								...options,
								headers: {
									...options?.headers,
									"Content-Type": contentType || "application/javascript",
									"Content-Length": content.length.toString(),
								},
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

					if (baseUrl !== "/" && parent?.startsWith("file://")) {
						if (!parent.replace("file://", "").startsWith(baseUrl)) {
							return next();
						}
					}

					const aliasPaths = resolveFromAlias(path, alias);
					if (aliasPaths.length > 0) {
						aliasPaths.forEach((resolvedPath) => {
							const basedUrl = resolveFromBaseUrl(resolvedPath, baseUrl);
							if (resolvedPath.startsWith("/")) {
								potentialPaths.add(resolvedPath);
							} else {
								potentialPaths.add(basedUrl);
							}
						});
					} else {
						if (
							path.startsWith("./") ||
							path.startsWith("../") ||
							path === ".."
						) {
							if (!parent) return next({ path, parent });
							path = resolveRelativePath(parent, path);
							if (path === "/") path = "";
						}

						potentialPaths.add(path);
						potentialPaths.add(resolveFromBaseUrl(path, baseUrl));
					}

					if (resolveIndex) {
						for (const candidatePath of Array.from(potentialPaths)) {
							const parts = candidatePath.split("/");
							if (parts.length > 0 && parts[parts.length - 1] === "") {
								parts.pop();
							}
							potentialPaths.add(`${parts.join("/")}/index`);
						}
					}

					for (const ext of extensions) {
						for (const candidatePath of potentialPaths) {
							const extension = candidatePath.split(".").pop();
							if (`.${extension}` === ext) continue;
							potentialPaths.add(
								`${candidatePath.replace(`.${extension}`, "")}${ext}`,
							);
						}
						potentialPaths.add(`${path}${ext}`);
					}

					potentialPaths.forEach((candidatePath) => {
						// Skip paths that are not valid or do not end with a known extension
						if (!extensions.some((ext) => candidatePath.endsWith(ext))) {
							potentialPaths.delete(candidatePath);
							return;
						}

						const filename = candidatePath.split("/").pop();
						// Remove paths that are exactly the same as extensions (e.g., "/.ts")
						if (extensions.some((ext) => filename === ext)) {
							potentialPaths.delete(candidatePath);
							return;
						}

						// Remove paths that have empty segments (e.g., "//components")
						if (candidatePath.split("/").some((v, k) => v === "" && k > 0)) {
							potentialPaths.delete(candidatePath);
						}
					});

					for (const candidatePath of potentialPaths) {
						if (fs.readFile(candidatePath)) {
							logger.debug?.(`Resolved: ${candidatePath}`);
							return next({ path: `file://${candidatePath}`, parent });
						}
					}

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
	if (baseUrl === "/") return `/${path}`;
	const baseParts = baseUrl.split("/");
	const pathParts = path.split("/").filter((part, keyPart) => {
		return baseParts[keyPart] !== part && part !== "";
	});

	const result = `/${[...baseParts.filter(Boolean), ...pathParts].join("/")}`;
	return result;
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
