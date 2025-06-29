import { BundlerRegistry } from "./blundler-registry";

export class ExternalRegistry extends BundlerRegistry<any, any> {
	protected buildRegistry(key: string, item: any): any {
		return item;
	}
}
