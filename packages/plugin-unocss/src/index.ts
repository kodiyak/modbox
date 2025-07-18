import { definePlugin } from "@modpack/utils";
import type { PresetWind3Options, Theme } from "@unocss/preset-wind3";
import initUnocssRuntime, { type RuntimeOptions } from "@unocss/runtime";
import { defineConfig, presetWind3, type UserConfig } from "unocss";

interface UnocssOptions extends RuntimeOptions {
	wind3?: PresetWind3Options;
	config?: UserConfig<Theme>;
}

export function unocss({ wind3, config, ...options }: UnocssOptions) {
	return definePlugin({
		name: "@modpack/plugin-unocss",
		onBoot: async () => {
			initUnocssRuntime({
				...options,
				defaults: defineConfig({
					...config,
					presets: [
						presetWind3({
							...wind3,
						}),
					],
				}),
			});
		},
	});
}
