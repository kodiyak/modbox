export class PolyfillFetcher {
	public readonly cache = new Map<string, Promise<Response>>();

	async fetch(url: string, opts?: RequestInit) {
		if (this.cache.has(url)) {
			return this.cache.get(url);
		}

		const result = fetch(url, opts);
		this.cache.set(url, result);
		return result;
	}
}
