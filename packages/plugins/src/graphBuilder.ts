import { definePlugin } from "@modpack/utils";

export function graphBuilder() {
	return definePlugin({
		analyze: {
			process: ({ node, dir, isType, dependencies, exports }) => {
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
			},
		},
	});
}
