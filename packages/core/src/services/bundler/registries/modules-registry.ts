import { AbstractBundlerRegistry } from "./bundler-registry";

export class ModulesRegistry extends AbstractBundlerRegistry<string, any> {
	// @ts-expect-error: This is a placeholder for the type, which can be defined later.
	protected buildRegistry(key: string, item: any): any {
		return item;
	}
}
