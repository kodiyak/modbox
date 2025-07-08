import { definePlugin } from "@modpack/utils";

interface InjectProps {
	modules: Record<string, any>;
	globalKey?: string;
	self?: any;
}

export function inject(props: InjectProps) {
	const {
		modules,
		globalKey = "__MODPACK_INJECT__",
		self = globalThis,
	} = props;
	return definePlugin({
		name: "@modpack/plugin-inject",
		onBoot: async () => {
			if (typeof self !== "undefined" && self !== null) {
				self[globalKey] = modules;
			} else {
				throw new Error(
					"Inject plugin can only be used in a browser environment.",
				);
			}
		},
		pipeline: {
			fetcher: {
				fetch: async ({ url, next }) => {
					for (const [key, value] of Object.entries(modules)) {
						if (url === `internal://${key}`) {
							return new Response(
								[
									`const mod = self['${globalKey}']['${key}'];`,
									`export { mod as default };`,
									...getModuleKeys(value).map(
										(m) => `export const ${m} = mod['${m}']`,
									),
								].join("\n"),
								{
									headers: {
										"Content-Type": "application/javascript",
									},
								},
							);
						}
					}

					return next();
				},
			},
			resolver: {
				resolve: ({ next, path, parent }) => {
					for (const key of Object.keys(modules)) {
						if (path === key) {
							return next({ path: `internal://${key}`, parent });
						}
					}

					return next();
				},
			},
		},
	});
}

function getModuleKeys(module: any): string[] {
	return Object.keys(module).filter((key) => {
		if (
			[
				"default",
				"enum",
				"typeof",
				"instanceof",
				"function",
				"null",
				"undefined",
				"void",
			].includes(key)
		) {
			return false;
		}

		if (key.startsWith("_")) {
			return false;
		}

		return true;
	});
}
