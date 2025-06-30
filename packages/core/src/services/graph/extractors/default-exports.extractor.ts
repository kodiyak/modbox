import { defineModuleExtractor } from "../utils";

export function createDefaultExportsExtractor() {
	return defineModuleExtractor(({ node }, { isType, exports }) => {
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
					exports.addExported({
						name: "default",
					});
				}
			}
		}

		if (isType(node, "ExportNamedDeclaration")) {
			for (const specifier of node.specifiers) {
				if (specifier.type === "ExportSpecifier") {
					exports.addExported({
						name: specifier.orig.value,
					});
				} else if (specifier.type === "ExportDefaultSpecifier") {
					exports.addExported({
						name: specifier.exported.value,
					});
				}
			}
		}

		if (isType(node, "ExportAllDeclaration")) {
			if (node.source.value) {
				exports.addExported({
					name: node.source.value,
				});
			} else {
				exports.addExported({
					name: "default",
				});
			}
		}

		if (isType(node, "ExportDeclaration")) {
			if (
				node.declaration.type === "FunctionDeclaration" ||
				node.declaration.type === "ClassDeclaration"
			) {
				exports.addExported({
					name: node.declaration.identifier.value,
				});
			}
		}
	});
}
