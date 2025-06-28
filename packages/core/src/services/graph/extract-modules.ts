import type {
	AssignmentExpression,
	ImportSpecifier,
	ModuleItem,
} from "@swc/wasm";
import type { ParsedModule } from "./swc-parser";

export interface ExtractedDependency {
	type: "dependency";
	path: string;
	names: string[];
}

export interface ExtractedExport {
	type: "export";
	name: string;
}

export type ExtractedModule = ExtractedDependency | ExtractedExport;

interface ExtractModulesProps {
	content: string;
	path: string;
	parsed: ParsedModule;
}

export function extractModules({
	path,
	parsed,
}: ExtractModulesProps): ExtractedModule[] {
	const folderPath = path.substring(0, path.lastIndexOf("/"));

	const extracted: ExtractedModule[] = [];

	for (const node of parsed.body) {
		if (isNode(node, "ImportDeclaration")) {
			const updatedPath = node.source.value.startsWith("./")
				? `${folderPath}/${node.source.value.substring(2)}`
				: node.source.value;

			const names = node.specifiers
				.map((s) => {
					if (s.type === "ImportSpecifier") {
						return (s as ImportSpecifier).local.value;
					}
					if (s.type === "ImportDefaultSpecifier") {
						return "default";
					}
					if (s.type === "ImportNamespaceSpecifier") {
						return "*";
					}
					return "";
				})
				.filter((name) => name !== "");

			extracted.push({
				type: "dependency",
				path: updatedPath,
				names,
			});
		} else if (isNode(node, "ExpressionStatement")) {
			if (node.expression.type === "AssignmentExpression") {
				const assignmentExpr = node.expression as AssignmentExpression;
				if (
					assignmentExpr.operator === "=" &&
					assignmentExpr.left.type === "MemberExpression" &&
					assignmentExpr.left.object.type === "Identifier" &&
					assignmentExpr.left.object.value === "module" &&
					assignmentExpr.left.property.type === "Identifier" &&
					assignmentExpr.left.property.value === "exports"
				) {
					extracted.push({
						type: "export",
						name: "default",
					});
				}
			}
		} else if (isNode(node, "ExportNamedDeclaration")) {
			for (const specifier of node.specifiers) {
				if (specifier.type === "ExportSpecifier") {
					extracted.push({
						type: "export",
						name: specifier.orig.value,
					});
				} else if (specifier.type === "ExportDefaultSpecifier") {
					extracted.push({
						type: "export",
						name: specifier.exported.value,
					});
				}
			}
		}
	}

	return extracted;
}

function isNode<K extends ModuleItem["type"]>(
	node: any,
	type: K,
): node is Extract<ModuleItem, { type: K }> {
	return (node as any).type === type;
}
