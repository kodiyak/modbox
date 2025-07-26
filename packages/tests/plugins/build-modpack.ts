import {
	BlobsRegistry,
	Bundler,
	BundlerRegistry,
	ExternalRegistry,
	getModpackPlugin,
	getPluginLogger,
	getPluginReporter,
	Logger,
	type ModpackBootOptions,
	ModulesRegistry,
	Orchestrator,
	PolyfillFetcher,
	PolyfillResolver,
	PolyfillSourcer,
	ResponseRegistry,
	VirtualFiles,
} from "@modpack/core/__internal-tests";

export function buildModpack({
	debug,
	plugins = [],
	...rest
}: ModpackBootOptions) {
	const fs = new VirtualFiles(Logger.create("virtual-files"));
	plugins.push(getModpackPlugin(rest));
	const registry = BundlerRegistry.create({
		blobs: new BlobsRegistry(Logger.create("blobs-registry")),
		responses: new ResponseRegistry(Logger.create("responses-registry")),
		modules: new ModulesRegistry(Logger.create("modules-registry")),
		external: new ExternalRegistry(Logger.create("external-registry")),
	});
	const fetcher = new PolyfillFetcher(
		Logger.create("modules-fetcher"),
		registry,
		fs,
		plugins
			.filter((plugin) => plugin.pipeline?.fetcher)
			.map((plugin) => ({
				name: plugin.name,
				...plugin.pipeline?.fetcher!,
			})),
		{
			onFetchStart: async (props) => {
				await Promise.all(
					plugins.map(async (plugin) =>
						plugin.onFetchStart?.({
							...props,
							logger: getPluginLogger(plugin.name),
							reporter: getPluginReporter(plugin.name),
						}),
					),
				);
			},
		},
	);
	const sourcer = new PolyfillSourcer(
		Logger.create("modules-sourcer"),
		registry,
		fs,
		plugins
			.filter((plugin) => plugin.pipeline?.sourcer)
			.map((plugin) => ({
				name: plugin.name,
				...plugin.pipeline?.sourcer!,
			})),
		{
			onSourceStart: async (props) => {
				await Promise.all(
					plugins.map(async (plugin) =>
						plugin.onSourceStart?.({
							...props,
							logger: getPluginLogger(plugin.name),
							reporter: getPluginReporter(plugin.name),
						}),
					),
				);
			},
			onSourceEnd: async (props) => {
				await Promise.all(
					plugins.map(async (plugin) =>
						plugin.onSourceEnd?.({
							...props,
							logger: getPluginLogger(plugin.name),
							reporter: getPluginReporter(plugin.name),
						}),
					),
				);
			},
		},
	);
	const resolver = new PolyfillResolver(
		Logger.create("modules-resolver"),
		registry,
		fs,
		plugins
			.filter(
				(plugin) =>
					plugin.pipeline?.resolver && !plugin.pipeline?.resolver?.fallback,
			)
			.map((plugin) => ({
				name: plugin.name,
				...plugin.pipeline?.resolver!,
			})),
		plugins
			.filter((plugin) => plugin.pipeline?.resolver?.fallback)
			.map((plugin) => ({
				name: plugin.name,
				...plugin.pipeline?.resolver!,
			})),
		{
			onResolveStart: async (props) => {
				await Promise.all(
					plugins.map(async (plugin) =>
						plugin.onResolveStart?.({
							...props,
							logger: getPluginLogger(plugin.name),
							reporter: getPluginReporter(plugin.name),
						}),
					),
				);
			},
			onResolveEnd: async (props) => {
				await Promise.all(
					plugins.map(async (plugin) =>
						plugin.onResolveEnd?.({
							...props,
							logger: getPluginLogger(plugin.name),
							reporter: getPluginReporter(plugin.name),
						}),
					),
				);
			},
		},
	);
	const bundler = new Bundler(
		Logger.create("bundler"),
		registry,
		fetcher,
		resolver,
		sourcer,
	);

	const orchestrator = new Orchestrator(
		{
			debug,
			onBuildStart: async (props) => {
				await Promise.all(
					plugins.map(async (plugin) =>
						plugin?.onBuildStart?.({
							...props,
							logger: getPluginLogger(plugin.name),
							reporter: getPluginReporter(plugin.name),
						}),
					),
				);
			},
			onBuildEnd: async (props) => {
				await Promise.all(
					plugins.map(async (plugin) =>
						plugin?.onBuildEnd?.({
							...props,
							logger: getPluginLogger(plugin.name),
							reporter: getPluginReporter(plugin.name),
						}),
					),
				);
			},
			onModuleUpdate: async (props) => {
				await Promise.all(
					plugins.map(async (plugin) =>
						plugin?.onModuleUpdate?.({
							...props,
							logger: getPluginLogger(plugin.name),
							reporter: getPluginReporter(plugin.name),
						}),
					),
				);
			},
			onLog: async (props) => {
				await Promise.all(
					plugins.map(async (plugin) =>
						plugin?.onLog?.({
							...props,
							logger: getPluginLogger(plugin.name),
							reporter: getPluginReporter(plugin.name),
						}),
					),
				);
			},
		},
		Logger.create("orchestrator"),
		bundler,
		fs,
	);

	return orchestrator;
}
