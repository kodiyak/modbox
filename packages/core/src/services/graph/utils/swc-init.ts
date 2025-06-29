export async function initSwc() {
	const startSwc = await import("@swc/wasm-web").then((swc) => swc.default);
	return startSwc();
}
