import { definePlugin } from "@modpack/utils";

interface ResolveOptions {
	extensions: string[];
	index?: boolean;
	alias?: Record<string, string>;
}

export function resolver({ extensions, index, alias }: ResolveOptions) {
	const resolveIndex = index !== false;
	return definePlugin({
		name: "@modpack/plugin-resolver",
		pipeline: {
			resolver: {
				resolve: ({ next, path, parent, logger, fs }) => {
					let retries = 0;
					const tryPath = (p: string, prefix = `virtual-file://`) => {
						const exists = fs.readFile(p);

						if (exists) {
							logger.debug(`[${path} => ${p}] found after ${retries} attempts`);
						} else {
							logger.debug(
								`[${path} => ${p}] not found after ${retries} attempts`,
							);
						}

						retries++;
						return exists ? `${prefix}${p}` : null;
					};
					const tryResolve = (pathToResolve: string) => {
						/**
						 * @todo Implement a more robust path resolution strategy
						 * This is a basic implementation that tries to resolve the path
						 */
						let resolvedPath: string | null = null;
						// Try without extensions first
						resolvedPath = tryPath(pathToResolve);
						if (resolvedPath) return resolvedPath;

						// Try with extensions
						if (pathToResolve.indexOf(".") === -1) {
							for (const ext of extensions) {
								resolvedPath = tryPath(`${pathToResolve}${ext}`);
								if (resolvedPath) return resolvedPath;
							}
						}

						// Try with index.js files
						if (resolveIndex && pathToResolve.indexOf(".") === -1) {
							for (const ext of extensions) {
								const indexPath = `${pathToResolve}/index${ext}`;
								resolvedPath = tryPath(indexPath);
								if (resolvedPath) return resolvedPath;
							}
						}

						// Try alias resolution
						if (alias) {
							for (const [aliasKey, aliasValue] of Object.entries(alias)) {
								if (pathToResolve.startsWith(aliasKey)) {
									const aliasedPath = pathToResolve.replace(
										aliasKey,
										aliasValue,
									);
									resolvedPath = tryPath(aliasedPath);
									if (resolvedPath) return resolvedPath;

									for (const ext of extensions) {
										const aliasedWithExt = `${aliasedPath}${ext}`;
										resolvedPath = tryPath(aliasedWithExt);
										if (resolvedPath) return resolvedPath;
									}

									if (resolveIndex && aliasedPath.indexOf(".") === -1) {
										for (const ext of extensions) {
											const indexPath = `${aliasedPath}/index${ext}`;
											resolvedPath = tryPath(indexPath);
											if (resolvedPath) return resolvedPath;
										}
									}
								}
							}
						}
					};

					const resolvedPath = tryResolve(path);
					if (resolvedPath) return resolvedPath;
					// If no resolution was found, call the next resolver
					const resolved = next({ path, parent });
					const resolvedFromNext = tryResolve(resolved);
					if (resolvedFromNext) return resolvedFromNext;

					return resolved;
				},
			},
		},
	});
}
