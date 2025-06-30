import { defineModuleExtractor } from "../utils";

export function createDefaultImportsExtractor() {
	return defineModuleExtractor(({ node, dir }, { isType, dependencies }) => {
		if (isType(node, "ImportDeclaration")) {
			const updatedPath = node.source.value.startsWith("./")
				? node.source.value.replace(/^\.\//, `${dir}/`)
				: node.source.value;

			dependencies.addDependency({
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
	});
}
