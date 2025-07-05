import { PluginReporter } from "../plugin-reporter";

export function getPluginReporter(name: string): PluginReporter {
	return PluginReporter.create(name);
}
