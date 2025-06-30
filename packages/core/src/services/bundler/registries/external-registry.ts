import { AbstractBundlerRegistry } from "./bundler-registry";

export class ExternalRegistry extends AbstractBundlerRegistry<string, any> {
	protected buildRegistry(key: string, item: any): any {
		return item;
	}
}
