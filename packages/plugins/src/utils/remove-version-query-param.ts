export function removeVersionQueryParam(pathOrUrl: string): string {
	const versionQueryParam = pathOrUrl.match(/\?v=\d+$/);
	if (versionQueryParam) {
		return pathOrUrl.slice(0, -versionQueryParam[0].length);
	}
	return pathOrUrl;
}
