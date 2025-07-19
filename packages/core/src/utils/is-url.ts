export function isUrl(path: string): boolean {
	try {
		new URL(path);
		return true;
	} catch (error) {
		return false;
	}
}
