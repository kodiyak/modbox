import {
	BundlerRegistry,
	Logger,
	PluginReporter,
} from "@modpack/core/__internal-tests";
import { type ResolverOptions, resolver } from "@modpack/plugins";
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

	const runPlugin = (
		pluginOptions: ResolverOptions,
		path: string,
		parent = "",
	) => {
		const plugin = resolver(pluginOptions);
		plugin.pipeline?.resolver?.resolve?.({
			fs: modpack.fs,
			path,
			parent,
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("resolver-test"),
		});
	};

	it("should resolve a path with known extension", () => {
		modpack.fs.writeFile("/entry.ts", "console.log('ok');");
		runPlugin({ extensions: [".ts"] }, "/entry.ts");

		expect(next).toHaveBeenCalledWith({ path: "file:///entry.ts", parent: "" });
	});

	it("should resolve a path without extension by trying extensions list", () => {
		modpack.fs.writeFile("/entry.ts", "console.log('ok');");
		runPlugin({ extensions: [".ts", ".js"] }, "/entry");

		expect(next).toHaveBeenCalledWith({ path: "file:///entry.ts", parent: "" });
	});

	it("should resolve index file when index option is true", () => {
		modpack.fs.writeFile("/dir/index.ts", "console.log('index');");
		runPlugin({ extensions: [".ts"], index: true }, "/dir");

		expect(next).toHaveBeenCalledWith({
			path: "file:///dir/index.ts",
			parent: "",
		});
	});

	it("should apply alias replacements", () => {
		modpack.fs.writeFile("/real/path/file.js", "console.log('alias');");
		runPlugin(
			{ alias: { "@alias/": "/real/path/" }, extensions: [".js"] },
			"@alias/file.js",
		);

		expect(next).toHaveBeenCalledWith({
			path: "file:///real/path/file.js",
			parent: "",
		});
	});

	it("should resolve relative path against parent", () => {
		modpack.fs.writeFile("/src/util.ts", "export const util = true;");
		runPlugin({ extensions: [".ts"] }, "./util", "/src/main.ts");

		expect(next).toHaveBeenCalledWith({
			path: "file:///src/util.ts",
			parent: "/src/main.ts",
		});
	});

	it("should not resolve if path does not match anything", () => {
		runPlugin({ extensions: [".js"] }, "/not/found");

		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith();
	});

	it("should skip resolution if path is a full URL", () => {
		runPlugin({}, "https://cdn.com/module.js");

		expect(next).toHaveBeenCalledWith();
	});

	it("should resolve relative path using '..' to move up directories", () => {
		modpack.fs.writeFile("/shared/util.ts", "export const shared = true;");
		runPlugin({ extensions: [".ts"] }, "../shared/util", "/src/main.ts");

		expect(next).toHaveBeenCalledWith({
			path: "file:///shared/util.ts",
			parent: "/src/main.ts",
		});
	});

	it("should normalize complex relative paths with ../ and ./", () => {
		modpack.fs.writeFile("/lib/core/utils.ts", "export const fn = () => {};");
		runPlugin(
			{ extensions: [".ts"] },
			"../core/./utils",
			"/lib/modules/module.ts",
		);

		expect(next).toHaveBeenCalledWith({
			path: "file:///lib/core/utils.ts",
			parent: "/lib/modules/module.ts",
		});
	});

	it('should resolve relative paths with leading "../"', () => {
		modpack.fs.writeFile(
			"/shared/utils/helper.ts",
			"export const helper = true;",
		);
		runPlugin(
			{ extensions: [".ts"] },
			"../../shared/utils/helper",
			"/src/components/button.ts",
		);

		expect(next).toHaveBeenCalledWith({
			path: "file:///shared/utils/helper.ts",
			parent: "/src/components/button.ts",
		});
	});

	it("should resolve relative paths to 'index.tsx' file with leading '../'", () => {
		modpack.fs.writeFile("/index.tsx", "export const Button = true;");
		runPlugin(
			{ extensions: [".tsx"], index: true },
			"../",
			"/previews/main.tsx",
		);

		expect(next).toHaveBeenCalledWith({
			path: "file:///index.tsx",
			parent: "/previews/main.tsx",
		});
	});

	it("should resolve relative paths to 'index.tsx' file with leading '..'", () => {
		modpack.fs.writeFile("/index.tsx", "export const Button = true;");
		runPlugin(
			{ extensions: [".tsx"], index: true },
			"..",
			"/components/previews/main.tsx",
		);

		expect(next).toHaveBeenCalledWith({
			path: "file:///index.tsx",
			parent: "/components/previews/main.tsx",
		});
	});

	it("should prioritize extensions based on provided order", () => {
		modpack.fs.writeFile("/entry.ts", "console.log('ts');");
		modpack.fs.writeFile("/entry.js", "console.log('js');");
		runPlugin({ extensions: [".ts", ".js"] }, "/entry");

		expect(next).toHaveBeenCalledWith({
			path: "file:///entry.ts",
			parent: "",
		});
	});

	it("should resolve alias without trailing slash", () => {
		modpack.fs.writeFile("/shared/utils/file.ts", "ok");
		runPlugin(
			{ alias: { "@utils": "/shared/utils" }, extensions: [".ts"] },
			"@utils/file",
		);

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
		runPlugin(
			{ extensions: [".ts"], index: true },
			"./button",
			"/components/main.ts",
		);

		expect(next).toHaveBeenCalledWith({
			path: "file:///components/button/index.ts",
			parent: "/components/main.ts",
		});
	});

	it("should fallback to next with original path if not resolvable", () => {
		runPlugin({ extensions: [".ts"] }, "/unknown/module", "/main.ts");

		expect(next).toHaveBeenCalledWith();
	});
});
