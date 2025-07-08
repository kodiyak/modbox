import {
	BundlerRegistry,
	Logger,
	PluginReporter,
} from "@modpack/core/__internal-tests";
import { resolver } from "@modpack/plugins";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildModpack } from "./build-modpack";

describe("resolver plugin", () => {
	let modpack: ReturnType<typeof buildModpack>;
	let logger: ReturnType<typeof Logger.create>;
	let next: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		modpack = buildModpack({});
		logger = Logger.create("resolver-test");
		next = vi.fn();
	});

	it("should resolve a path with known extension", () => {
		modpack.fs.writeFile("/entry.ts", "console.log('ok');");

		const plugin = resolver({ extensions: [".ts"] });
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "/entry.ts",
			parent: "",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({ path: "file:///entry.ts", parent: "" });
	});

	it("should resolve a path without extension by trying extensions list", () => {
		modpack.fs.writeFile("/entry.ts", "console.log('ok');");

		const plugin = resolver({ extensions: [".ts", ".js"] });
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "/entry",
			parent: "",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({ path: "file:///entry.ts", parent: "" });
	});

	it("should resolve index file when index option is true", () => {
		modpack.fs.writeFile("/dir/index.ts", "console.log('index');");

		const plugin = resolver({ extensions: [".ts"], index: true });
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "/dir",
			parent: "",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "file:///dir/index.ts",
			parent: "",
		});
	});

	it("should apply alias replacements", () => {
		modpack.fs.writeFile("/real/path/file.js", "console.log('alias');");

		const plugin = resolver({
			alias: { "@alias/": "/real/path/" },
			extensions: [".js"],
		});
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "@alias/file.js",
			parent: "",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "file:///real/path/file.js",
			parent: "",
		});
	});

	it("should resolve relative path against parent", () => {
		modpack.fs.writeFile("/src/util.ts", "export const util = true;");

		const plugin = resolver({ extensions: [".ts"] });
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "./util",
			parent: "/src/main.ts",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "file:///src/util.ts",
			parent: "/src/main.ts",
		});
	});

	it("should not resolve if path does not match anything", () => {
		const plugin = resolver({ extensions: [".js"] });
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "/not/found",
			parent: "",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith({ path: "/not/found", parent: "" });
	});

	it("should skip resolution if path is a full URL", () => {
		const plugin = resolver({});
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "https://cdn.com/module.js",
			parent: "",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "https://cdn.com/module.js",
			parent: "",
		});
	});

	it("should resolve relative path using '..' to move up directories", () => {
		modpack.fs.writeFile("/shared/util.ts", "export const shared = true;");

		const plugin = resolver({ extensions: [".ts"] });
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "../shared/util",
			parent: "/src/main.ts",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "file:///shared/util.ts",
			parent: "/src/main.ts",
		});
	});

	it("should normalize complex relative paths with ../ and ./", () => {
		modpack.fs.writeFile("/lib/core/utils.ts", "export const fn = () => {};");

		const plugin = resolver({ extensions: [".ts"] });
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "../core/./utils",
			parent: "/lib/modules/module.ts",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "file:///lib/core/utils.ts",
			parent: "/lib/modules/module.ts",
		});
	});

	it("should prioritize extensions based on provided order", () => {
		modpack.fs.writeFile("/entry.ts", "console.log('ts');");
		modpack.fs.writeFile("/entry.js", "console.log('js');");

		const plugin = resolver({ extensions: [".ts", ".js"] });
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "/entry",
			parent: "",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "file:///entry.ts",
			parent: "",
		});
	});

	it("should resolve alias without trailing slash", () => {
		modpack.fs.writeFile("/shared/utils/file.ts", "ok");

		const plugin = resolver({
			alias: {
				"@utils": "/shared/utils",
			},
			extensions: [".ts"],
		});

		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "@utils/file",
			parent: "",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "file:///shared/utils/file.ts",
			parent: "",
		});
	});

	it("should resolve to index file from relative folder path", () => {
		modpack.fs.writeFile(
			"/components/button/index.ts",
			"export const Btn = true;",
		);

		const plugin = resolver({ extensions: [".ts"], index: true });

		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "./button",
			parent: "/components/main.ts",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "file:///components/button/index.ts",
			parent: "/components/main.ts",
		});
	});

	it("should fallback to next with original path if not resolvable", () => {
		const plugin = resolver({ extensions: [".ts"] });

		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path: "/unknown/module",
			parent: "/main.ts",
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});

		expect(next).toHaveBeenCalledWith({
			path: "/unknown/module",
			parent: "/main.ts",
		});
	});
});
