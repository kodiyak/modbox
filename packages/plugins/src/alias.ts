import { definePlugin } from "@modpack/utils";

interface AliasOptions {
	[alias: string]: string;
}

export function alias(options: AliasOptions) {
	const sortedAliases = Object.keys(options).sort(
		(a, b) => b.length - a.length,
	);

	return definePlugin({
		pipeline: {
			resolver: {
				resolve: ({ next, path, logger }) => {
					logger.debug(`[alias]: Resolving alias for: ${path}`);

					for (const alias of sortedAliases) {
						if (path.startsWith(alias)) {
							const realPath = path.replace(alias, options[alias]);
							logger.debug(`[alias][${path} => ${realPath}]`);
							return next({ path: `virtual-file://${realPath}` });
						}
					}

					return next();
				},
			},
		},
	});
}
