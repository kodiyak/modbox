export class BlobsRegistry {
	private blobs: Map<string, string> = new Map();

	register(url: string, opts?: BlobPropertyBag) {
		if (this.blobs.has(url)) {
			throw new Error(`Blob with URL ${url} is already registered.`);
		}

		const blob = new Blob([url], {
			type: "text/javascript",
			...opts,
		});

		this.blobs.set(url, URL.createObjectURL(blob));
	}

	getBlobUrl(url: string) {
		return this.blobs.get(url);
	}
}
