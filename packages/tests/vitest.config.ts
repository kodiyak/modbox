import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

console.log(resolve("../plugins/src/index.ts"));
export default defineConfig({
	test: {
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html"],
			allowExternal: true,
		},
		alias: {
			"@modpack/plugins": resolve("../plugins/src/index.ts"),
		},
	},
});
