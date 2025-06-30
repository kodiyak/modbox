import { definePlugin } from "@modbox/utils";

export function graphBuilder() {
	return definePlugin({
		analyze: {
			process: (
				{ node, dir },
				{ isType, dependenciesRegistry, exportsRegistry },
			) => {
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

				if (isType(node, "ExportDeclaration")) {
					if (
						node.declaration.type === "FunctionDeclaration" ||
						node.declaration.type === "ClassDeclaration"
					) {
						exportsRegistry.addExported({
							name: node.declaration.identifier.value,
						});
					}
				}

				return {
					dependencies: [],
					exported: [],
				};
			},
		},
	});
}
