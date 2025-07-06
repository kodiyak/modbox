import { definePlugin } from "@modpack/utils";
import {
	createSignatureFunctionForTransform,
	injectIntoGlobalHook,
	performReactRefresh,
	register,
} from "react-refresh";

interface ReactOptions {
	self?: any;
	extensions?: string[];
}

export function react({
	self = globalThis,
	extensions = [".tsx", ".jsx"],
}: ReactOptions) {
	return definePlugin({
		name: "react",
		onBoot: async () => {
			injectIntoGlobalHook(self);
			Object.assign(self, {
				$RefreshReg$: register,
				$RefreshSig$: createSignatureFunctionForTransform,
			});
		},
		onModuleUpdate: async ({ result, logger, path, reporter }) => {
			if (extensions.some((ext) => path.endsWith(ext))) {
				const { default: Component } = result;
				if (Component && typeof Component === "function") {
					logger.info(`Performing React Refresh for ${path}`);
					let update = performReactRefresh();
					while (!update) {
						update = performReactRefresh();
						await new Promise((resolve) => setTimeout(resolve, 100));
					}

					reporter.log("info", `React Refresh completed for ${path}`);
				}
			}
		},
	});
}
