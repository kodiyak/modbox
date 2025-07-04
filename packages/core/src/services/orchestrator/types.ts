import type { Logger } from "../../shared";
import type { BundlerBuildOptions } from "../bundler";
import type { VirtualFiles } from "../types";

export type OnMountHook = (props: {
	entrypoint: string;
	options?: OrchestratorMountOptions;
	error: Error | null;
	result?: any;
	fs: VirtualFiles;
	logger: Logger;
}) => Promise<void> | void;
export type OnModuleUpdateHook = (props: {
	path: string;
	content: string;
	error: Error | null;
	updated: boolean;
	result?: any;
	fs: VirtualFiles;
	logger: Logger;
}) => Promise<void> | void;
export interface OrchestratorHooks {
	onMount?: OnMountHook;
	onModuleUpdate?: OnModuleUpdateHook;
}

export interface OrchestratorOptions extends OrchestratorHooks {
	debug?: boolean;
}

export interface OrchestratorMountOptions extends BundlerBuildOptions {}
