import { AbstractBundlerRegistry } from "./bundler-registry";

export class ExternalRegistry extends AbstractBundlerRegistry<any, any> {
	protected buildRegistry(key: string, item: any): any {
		return item;
	}
}
