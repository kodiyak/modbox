import { defineResolver } from "../../utils/define-resolver";

export function createModulesResolver() {
	return defineResolver({
		resolve: ({ path, next }, { logger, registry }) => {
			logger.debug(
				`Injected resolver: Resolving module [${path}]`,
				registry.get("modules").get(path),
			);
			const module = registry.get("modules").get(path);
			if (module) {
				const url = `modules://${path}`;
				const blobURL = registry.get("blobs").get(url);
				if (blobURL) return blobURL;

				const source = `
					const mod = window.__modboxModules['${path}'];
					export { mod as default };
					${getKeys(module)
						.map((key) => `export const ${key} = mod.${key};`)
						.join("\n")}
				`
					.split("\n")
					.map((v) => v.trim())
					.join("\n")
					.trim();
				const blob = new Blob([source], {
					type: "application/javascript",
				});
				const moduleURL = URL.createObjectURL(blob);

				logger.debug(`[${path}] Module URL: [${url} => ${moduleURL}]`);
				registry.get("blobs").register(url, moduleURL);
				registry.get("responses").register(
					moduleURL,
					new Response(blob, {
						headers: {
							"Content-Type": "application/javascript",
							"Content-Length": blob.size.toString(),
						},
					}),
				);
				return moduleURL;
			}

			return next();
		},
	});
}

function getKeys(module: any): string[] {
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
