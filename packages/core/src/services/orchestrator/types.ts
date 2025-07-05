import type { Logger } from "../../shared";
import type { BundlerBuildOptions } from "../bundler";
import type { IPluginReporter, IReportLevel } from "../plugins";
import type { VirtualFiles } from "../types";

export type OnBootHook = (props: {
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export type OnLogHook = (props: {
	message: string;
	level: IReportLevel;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export type OnModuleUpdateHook = (props: {
	path: string;
	content: string;
	error: Error | null;
	updated: boolean;
	result?: any;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export type OnBuildStartHook = (props: {
	entrypoint: string;
	options?: OrchestratorMountOptions;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export type OnBuildEndHook = (props: {
	entrypoint: string;
	options?: OrchestratorMountOptions;
	error: Error | null;
	result?: any;
	fs: VirtualFiles;
	logger: Logger;
	reporter: IPluginReporter;
}) => Promise<void> | void;
export interface OrchestratorHooks {
	onBoot?: OnBootHook;
	onModuleUpdate?: OnModuleUpdateHook;
	onBuildStart?: OnBuildStartHook;
	onBuildEnd?: OnBuildEndHook;
}

export interface OrchestratorOptions extends OrchestratorHooks {
	debug?: boolean;
}

export interface OrchestratorMountOptions extends BundlerBuildOptions {}
