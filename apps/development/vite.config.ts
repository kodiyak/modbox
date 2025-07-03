import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
	plugins: [react(), wasm()],
	optimizeDeps: {
		exclude: ["@swc/wasm-web"],
	},
	resolve: {
		alias: {
			"@modpack/core": path.resolve(
				__dirname,
				"../../packages/core/src/index.ts",
			),
			"@modpack/plugins": path.resolve(
				__dirname,
				"../../packages/plugins/src/index.ts",
			),
			"@modpack/utils": path.resolve(
				__dirname,
				"../../packages/utils/src/index.ts",
			),
		},
	},
});
