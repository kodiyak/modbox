function isTsPath(path: string): boolean {
	return path.endsWith(".ts") || path.endsWith(".tsx");
}

function isTsxPath(path: string): boolean {
	return path.endsWith(".tsx");
}

function isJsPath(path: string): boolean {
	return path.endsWith(".js") || path.endsWith(".jsx");
}

function isJsxPath(path: string): boolean {
	return path.endsWith(".jsx");
}

function isJsonPath(path: string): boolean {
	return path.endsWith(".json");
}

function isCssPath(path: string): boolean {
	return path.endsWith(".css");
}

function isBinPath(path: string): boolean {
	return (
		!isTsPath(path) &&
		!isJsPath(path) &&
		!isJsonPath(path) &&
		!isCssPath(path) &&
		!isJsxPath(path) &&
		!isTsxPath(path)
	);
}

export {
	isTsPath,
	isTsxPath,
	isJsPath,
	isJsxPath,
	isJsonPath,
	isCssPath,
	isBinPath,
};
