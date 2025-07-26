import { definePlugin, removeVersionQueryParam } from "@modpack/utils";
import startSwc, {
	initSync,
	type Module,
	type Options,
	type Output,
	parse,
	transform,
} from "@swc/wasm-web";

interface HookProps {
	url: string;
	originalContent: string;
}

type TransformResult = {
	parseContent?: string;
	parseOptions?: Options;
} | void;
type OnTransform = (
	props: HookProps & { transformed: Output },
) => TransformResult | Promise<TransformResult>;
type OnParse = (
	props: HookProps & { parsed: Module; transformed: Output },
) => void | Promise<void>;

export interface SwcOptions extends Options {
	extensions?: string[];
	contentTypes?: string[];
	onTransform?: OnTransform;
	onParse?: OnParse;
}

export function swc(options: SwcOptions = {}) {
	const {
		extensions = [],
		contentTypes = [],
		onTransform,
		onParse,
		...swcOptions
	} = options;
	return definePlugin({
		name: "@modpack/plugin-swc",
		onBoot: async () => {
			await startSwc();
		},
		pipeline: {
			fetcher: {
				fetch: async ({ url, next, options, logger }) => {
					const result = await next();
					if (!result || !(result instanceof Response)) {
						return result;
					}
					const contentType = result.headers.get("Content-Type");
					const filename = removeVersionQueryParam(new URL(url).pathname);

					const isTransformable = [
						contentTypes.some((type) => contentType?.includes(type)),
						extensions.some((ext) => filename.endsWith(ext)),
					].some(Boolean);

					if (isTransformable) {
						try {
							const originalContent = await result.text();
							const transformed = await transform(originalContent, {
								...swcOptions,
								filename,
							});

							const transformedResult = await onTransform?.({
								url,
								originalContent,
								transformed,
							});

							const transformedCode =
								transformedResult?.parseContent || transformed.code;

							const parsed = await parse(transformedCode, {
								syntax: "ecmascript",
								...swcOptions,
								...transformedResult?.parseOptions,
							});

							await onParse?.({
								url,
								originalContent,
								transformed: { ...transformed, code: transformedCode },
								parsed,
							});

							if (transformedCode) {
								return new Response(transformedCode, {
									...options,
									headers: {
										...options?.headers,
										"Content-Type": contentType || "application/javascript",
										"Content-Length": transformedCode.length.toString(),
									},
								});
							}
						} catch (error) {
							logger.error(`Error transforming ${url}:`, error);
						}
					}

					return result;
				},
			},
		},
	});
}
