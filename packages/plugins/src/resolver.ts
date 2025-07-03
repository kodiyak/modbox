import { definePlugin, isUrl } from "@modpack/utils";

interface ResolveOptions {
	extensions: string[];
	index?: boolean;
	alias?: Record<string, string>;
}

export function resolver(props?: ResolveOptions) {
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
			resolver: {
				resolve: ({ next, path: currentPath, parent, fs }) => {
					let path = currentPath;
					if (isUrl(path)) {
						return next({ path, parent });
					}

					// Resolve aliases
					for (const [aliasKey, aliasValue] of Object.entries(alias)) {
						if (path.startsWith(aliasKey)) {
							path = path.replace(aliasKey, aliasValue);
							break;
						}
					}

					const potentialPaths: string[] = [path];
					if (!path.startsWith("/")) {
						// If the path is not absolute, prepend the parent directory
						const parentDir = parent ? parent.replace(/\/[^/]+$/, "") : "";
						path = `${parentDir}/${path}`;
					}
					const hasExtension = extensions.some((ext) => path.endsWith(ext));
					if (!hasExtension) {
						// If no extension, try all extensions
						for (const ext of extensions) {
							potentialPaths.push(`${path}${ext}`);
						}
					}

					if (resolveIndex) {
						// If index is enabled, try appending "/index" to the path
						potentialPaths.push(`${path}/index`);
						for (const ext of extensions) {
							potentialPaths.push(`${path}/index${ext}`);
						}
					}

					for (const p of potentialPaths) {
						if (fs.readFile(p)) {
							return next({ path: `file://${p}`, parent });
						}
					}

					// Fallback to next resolver
					return next({ path: currentPath, parent });
				},
			},
		},
	});
}
