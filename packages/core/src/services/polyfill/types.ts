export type PolyfillResolver = (path: string, parent: string) => string;
export type PolyfillFetcher = (
	url: string,
	options?: RequestInit,
) => Promise<Response>;
