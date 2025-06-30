import { definePlugin } from "@modbox/utils";

interface ResolveOptions {
	extensions: string[];
	index?: boolean;
	alias?: Record<string, string>;
	external?: { [key: string]: string } | null;
}

export function resolver({
	extensions,
	index,
	alias,
	external,
}: ResolveOptions) {
	const resolveIndex = index !== false;
	return definePlugin({
		pipeline: {
			resolver: {
				resolve: ({ next, path, parent, logger, fs }) => {
					let retries = 0;
					const tryPath = (p: string) => {
						const exists = fs.readFile(p);

						if (exists) {
							logger.debug(
								`[resolve] [${path} => ${p}] found after ${retries} attempts`,
							);
						} else {
							logger.debug(
								`[resolve] [${path} => ${p}] not found after ${retries} attempts`,
							);
						}

						retries++;
						return exists ? `virtual-file://${p}` : null;
					};
					const tryResolve = (pathToResolve: string) => {
						let resolvedPath: string | null = null;
						// Try without extensions first
						resolvedPath = tryPath(pathToResolve);
						if (resolvedPath) return resolvedPath;

						// Try with extensions
						for (const ext of extensions) {
							resolvedPath = tryPath(`${pathToResolve}${ext}`);
							if (resolvedPath) return resolvedPath;
						}

						// Try with index.js files
						if (resolveIndex) {
							for (const ext of extensions) {
								const indexPath = `${pathToResolve}/index${ext}`;
								resolvedPath = tryPath(indexPath);
								if (resolvedPath) return resolvedPath;
							}
						}
					};

					const resolvedPath = tryResolve(path);
					if (resolvedPath) return resolvedPath;
					const resolved = next({ path, parent });

					const resolvedFromNext = tryResolve(resolved);
					if (resolvedFromNext) return resolvedFromNext;

					return resolved;
				},
			},
		},
	});
}
