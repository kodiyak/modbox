import { AbstractBundlerRegistry } from "./bundler-registry";

export class ExternalRegistry extends AbstractBundlerRegistry<string, any> {
	// @ts-expect-error: This is a placeholder for the type, which can be defined later.
	protected buildRegistry(key: string, item: any): any {
		return item;
	}
}
