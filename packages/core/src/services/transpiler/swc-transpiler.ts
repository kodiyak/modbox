import { transform } from "@swc/wasm-web";
import type { TranspilerFunction, TranspilerMap } from "./types";

const BASE_SWC_OPTIONS = {
	jsc: {
		target: "es2020",
		parser: {
			syntax: "ecmascript",
			jsx: false,
			decorators: false,
		},
		transform: {
			react: {
				runtime: "automatic",
			},
		},
	},
	module: {
		type: "es6",
	},
	sourceMaps: true,
};

export const swcTypeScriptTranspiler: TranspilerFunction = async (
	code,
	filePath,
	options,
) => {
	const config = {
		...BASE_SWC_OPTIONS,
		jsc: {
			...BASE_SWC_OPTIONS.jsc,
			parser: {
				...BASE_SWC_OPTIONS.jsc.parser,
				syntax: "typescript",
				tsx: false,
			},
		},
		filename: filePath,
		...options,
	};

	const output = await transform(code, config);
	return { code: output.code, map: output.map };
};

export const swcTsxTranspiler: TranspilerFunction = async (
	code,
	filePath,
	options,
) => {
	const config = {
		...BASE_SWC_OPTIONS,
		jsc: {
			...BASE_SWC_OPTIONS.jsc,
			parser: {
				...BASE_SWC_OPTIONS.jsc.parser,
				syntax: "typescript",
				tsx: true,
			},
		},
		filename: filePath,
		...options,
	};

	const output = await transform(code, config);
	return { code: output.code, map: output.map };
};

export const swcJavascriptTranspiler: TranspilerFunction = async (
	code,
	filePath,
	options,
) => {
	const config = {
		...BASE_SWC_OPTIONS,
		jsc: {
			...BASE_SWC_OPTIONS.jsc,
			parser: {
				...BASE_SWC_OPTIONS.jsc.parser,
				syntax: "ecmascript",
				jsx: false,
			},
		},
		filename: filePath,
		...options,
	};

	const output = await transform(code, config);
	return { code: output.code, map: output.map };
};

export const swcJsxTranspiler: TranspilerFunction = async (
	code,
	filePath,
	options,
) => {
	const config = {
		...BASE_SWC_OPTIONS,
		jsc: {
			...BASE_SWC_OPTIONS.jsc,
			parser: {
				...BASE_SWC_OPTIONS.jsc.parser,
				syntax: "ecmascript",
				jsx: true,
			},
		},
		filename: filePath,
		...options,
	};

	const output = await transform(code, config);
	return { code: output.code, map: output.map };
};

export const swcTranspilerMap: TranspilerMap = {
	typescript: swcTypeScriptTranspiler,
	tsx: swcTsxTranspiler,
	javascript: swcJavascriptTranspiler,
	jsx: swcJsxTranspiler,
	json: undefined,
	css: undefined,
	binary: undefined,
};
