import { definePlugin } from "@modpack/utils";
import { defineConfig, install, type TwindUserConfig } from "@twind/core";
import presetAutoprefix from "@twind/preset-autoprefix";
import presetExt from "@twind/preset-ext";
import presetLineClamp from "@twind/preset-line-clamp";
import presetTailwind from "@twind/preset-tailwind";
import presetTailwindForms from "@twind/preset-tailwind-forms";

interface TwindOptions extends Partial<TwindUserConfig<any, any>> {}

export function twind(config?: TwindOptions) {
	const { theme, ...rest } = config || {};
	const presets = [
		presetAutoprefix(),
		presetExt(),
		presetLineClamp(),
		presetTailwind(),
		presetTailwindForms(),
	];
	return definePlugin({
		name: "@modpack/plugin-twind",
		onBoot: async () => {
			const installOptions = defineConfig({
				theme,
				...rest,
				presets,
			});
			console.log("Twind options:", installOptions, install({ presets }));
		},
	});
}
