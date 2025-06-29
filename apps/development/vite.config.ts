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
			"@modbox/core": "../../../packages/core/src/index.ts",
		},
	},
});
