import type { ModuleExtractorHandler } from "../types";

export function defineModuleExtractor(extractor: ModuleExtractorHandler) {
	return extractor;
}
