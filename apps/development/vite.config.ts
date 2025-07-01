import react from "@vitejs/plugin-react-swc";
import path from "path";
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
		},
	},
});
