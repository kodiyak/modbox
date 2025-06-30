import { AbstractBundlerRegistry } from "./bundler-registry";

export class BlobsRegistry extends AbstractBundlerRegistry<
	BlobPropertyBag,
	string
> {
	protected buildRegistry(key: string, item: BlobPropertyBag): string {
		const blob = new Blob([key], {
			type: "text/javascript",
			...item,
		});
		return URL.createObjectURL(blob);
	}
}
