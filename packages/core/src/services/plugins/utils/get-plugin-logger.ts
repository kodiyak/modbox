import { Logger } from "../../../shared";

export function getPluginLogger(pluginName: string): Logger {
	return Logger.create(`plugin:${pluginName}`);
}
