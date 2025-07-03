import { definePlugin } from "@modpack/utils";

interface AliasOptions {
	[alias: string]: string;
}

export function alias(options: AliasOptions) {
	const sortedAliases = Object.keys(options).sort(
		(a, b) => b.length - a.length,
	);

	return definePlugin({
		name: "@modpack/plugin-alias",
		pipeline: {
			resolver: {
				resolve: ({ next, path, logger }) => {
					logger.debug(`Resolving ${path}`);

					for (const alias of sortedAliases) {
						if (path.startsWith(alias)) {
							const realPath = path.replace(alias, options[alias]);
							logger.debug(`Resolved [${path} => ${realPath}]`);
							return next({ path: `virtual-file://${realPath}` });
						}
					}

					return next();
				},
			},
		},
	});
}
