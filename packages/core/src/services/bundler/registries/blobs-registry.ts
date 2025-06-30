import { AbstractBundlerRegistry } from "./bundler-registry";

export class BlobsRegistry extends AbstractBundlerRegistry<string, string> {
	protected buildRegistry(key: string, item: string): string {
		return item;
	}
}
