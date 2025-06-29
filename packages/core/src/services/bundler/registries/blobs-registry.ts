import { BundlerRegistry } from "./blundler-registry";

export class BlobsRegistry extends BundlerRegistry<BlobPropertyBag, string> {
	protected buildRegistry(key: string, item: BlobPropertyBag): string {
		const blob = new Blob([key], {
			type: "text/javascript",
			...item,
		});
		return URL.createObjectURL(blob);
	}
}
