import type { DependenciesRegistry, ExportsRegistry } from "../registries";
import { defineModuleExtractor } from "../utils";

export function createDefaultImportsExtractor(
	dependenciesRegistry: DependenciesRegistry,
	exportsRegistry: ExportsRegistry,
) {
	return defineModuleExtractor(({ node, dir }, { isType }) => {
		if (isType(node, "ImportDeclaration")) {
			const updatedPath = node.source.value.startsWith("./")
				? node.source.value.replace(/^\.\//, `${dir}/`)
				: node.source.value;

			dependenciesRegistry.addDependency({
				path: updatedPath,
				names: node.specifiers.map((specifier) => {
					switch (specifier.type) {
						case "ImportSpecifier":
							return specifier.local.value;
						case "ImportDefaultSpecifier":
							return "default";
						case "ImportNamespaceSpecifier":
							return "*";
						default:
							return "";
					}
				}),
			});
		}

		return {
			dependencies: dependenciesRegistry.getAll(),
			exported: exportsRegistry.getAll(),
		};
	});
}
