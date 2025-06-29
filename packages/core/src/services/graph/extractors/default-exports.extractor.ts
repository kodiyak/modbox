import { defineModuleExtractor } from "../utils";

export function createDefaultExportsExtractor() {
	return defineModuleExtractor(
		({ node }, { isType, dependenciesRegistry, exportsRegistry }) => {
			if (isType(node, "ExpressionStatement")) {
				if (node.expression.type === "AssignmentExpression") {
					if (
						node.expression.operator === "=" &&
						node.expression.left.type === "MemberExpression" &&
						node.expression.left.object.type === "Identifier" &&
						node.expression.left.object.value === "module" &&
						node.expression.left.property.type === "Identifier" &&
						node.expression.left.property.value === "exports"
					) {
						exportsRegistry.addExported({
							name: "default",
						});
					}
				}
			}

			if (isType(node, "ExportNamedDeclaration")) {
				for (const specifier of node.specifiers) {
					if (specifier.type === "ExportSpecifier") {
						exportsRegistry.addExported({
							name: specifier.orig.value,
						});
					} else if (specifier.type === "ExportDefaultSpecifier") {
						exportsRegistry.addExported({
							name: specifier.exported.value,
						});
					}
				}
			}

			if (isType(node, "ExportAllDeclaration")) {
				if (node.source.value) {
					exportsRegistry.addExported({
						name: node.source.value,
					});
				} else {
					exportsRegistry.addExported({
						name: "default",
					});
				}
			}

			return {
				dependencies: dependenciesRegistry.getAll(),
				exported: exportsRegistry.getAll(),
			};
		},
	);
}
