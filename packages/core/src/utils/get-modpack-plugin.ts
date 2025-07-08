import type { ModpackPlugin } from "../services";
import type { ModpackBootOptions } from "../types";

export function getModpackPlugin({
	debug: _,
	plugins: __,
	...hooks
}: ModpackBootOptions) {
	const plugin: ModpackPlugin = {
		name: "runtime",
		...hooks,
	};

	return plugin;
}
