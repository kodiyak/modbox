import type { ModpackPlugin } from "./services/types";

export interface ModpackBootOptions {
	debug?: boolean;
	plugins?: ModpackPlugin[];
}

export * from "./services/types";
