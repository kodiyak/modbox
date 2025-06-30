import { AbstractBundlerRegistry } from "./bundler-registry";

export class ModulesRegistry extends AbstractBundlerRegistry<string, any> {
	protected buildRegistry(key: string, item: any): any {
		return item;
	}
}
