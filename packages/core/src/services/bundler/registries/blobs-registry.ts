import { AbstractBundlerRegistry } from "./bundler-registry";

export class BlobsRegistry extends AbstractBundlerRegistry<string, string> {
	// @ts-expect-error: This is a placeholder for the type, which can be defined later.
	protected buildRegistry(key: string, item: string): string {
		return item;
	}
}
