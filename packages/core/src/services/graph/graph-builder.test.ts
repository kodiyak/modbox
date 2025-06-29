import { beforeEach, describe, expect, it } from "vitest";
import { Logger } from "../../shared";
import { VirtualFiles } from "../virtual-files";
import {
	createDefaultExportsExtractor,
	createDefaultImportsExtractor,
} from "./extractors";
import { GraphBuilder } from "./graph-builder";
import { GraphModule } from "./graph-module";
import { ModulesExtractor } from "./modules-extractor";
import { DependenciesRegistry, ExportsRegistry } from "./registries";
import type { GraphBuilderOptions } from "./types";

describe("GraphBuilder", () => {
	let logger: Logger;
	let fs: VirtualFiles;
	let options: GraphBuilderOptions;
	let builder: GraphBuilder;
	let extractor: ModulesExtractor;

	beforeEach(() => {
		logger = new Logger("debug");
		fs = new VirtualFiles();
		options = {};
		extractor = new ModulesExtractor(logger, fs, [
			createDefaultImportsExtractor(
				new DependenciesRegistry(),
				new ExportsRegistry(),
			),
			createDefaultExportsExtractor(
				new DependenciesRegistry(),
				new ExportsRegistry(),
			),
		]);
		builder = new GraphBuilder(logger, fs, extractor, options);
	});

	it("adds and retrieves a module", () => {
		const mod = GraphModule.create({
			path: "@/foo",
			originalPath: "./src/foo.ts",
			runtime: 'import { foo } from "./bar";',
		});
		builder.addOrUpdateModule(mod);
		expect(builder.getModule("@/foo")).toBe(mod);
		expect(builder.getModules()).toEqual([mod]);
	});

	it("adds multiple modules and retrieves them all", () => {
		const mod1 = GraphModule.create({
			path: "@/foo",
			originalPath: "./src/foo.ts",
			runtime: 'import { foo } from "./bar";',
		});
		const mod2 = GraphModule.create({
			path: "@/bar",
			originalPath: "./src/bar.ts",
			runtime: "export const bar = 1;",
		});
		builder.addOrUpdateModule(mod1);
		builder.addOrUpdateModule(mod2);
		expect(builder.getModules()).toEqual([mod1, mod2]);
	});

	it("overwrites a module with the same path", () => {
		const mod1 = GraphModule.create({
			path: "@/foo",
			originalPath: "./src/foo.ts",
			runtime: 'import { foo } from "./bar";',
		});
		const mod2 = GraphModule.create({
			path: "@/foo",
			originalPath: "./src/foo2.ts",
			runtime: "export const foo = 2;",
		});
		builder.addOrUpdateModule(mod1);
		builder.addOrUpdateModule(mod2);
		expect(builder.getModule("@/foo")).toBe(mod2);
		expect(builder.getModules()).toEqual([mod2]);
		expect(builder.getModule("@/foo")?.toJSON().originalPath).toBe(
			"./src/foo2.ts",
		);
	});

	it("removes a module", () => {
		const mod = GraphModule.create({
			path: "@/foo",
			originalPath: "./src/foo.ts",
			runtime: 'import { foo } from "./bar";',
		});
		builder.addOrUpdateModule(mod);
		builder.removeModule("@/foo");
		expect(builder.getModule("@/foo")).toBeUndefined();
		expect(builder.getModules()).toEqual([]);
	});

	it("clears all modules", () => {
		const mod1 = GraphModule.create({
			path: "@/foo",
			originalPath: "./src/foo.ts",
			runtime: 'import { foo } from "./bar";',
		});
		const mod2 = GraphModule.create({
			path: "@/bar",
			originalPath: "./src/bar.ts",
			runtime: "export const bar = 1;",
		});
		builder.addOrUpdateModule(mod1);
		builder.addOrUpdateModule(mod2);
		builder.cleanup();
		expect(builder.getModules()).toEqual([]);
	});

	it("returns undefined for non-existent module", () => {
		expect(builder.getModule("@/does-not-exist")).toBeUndefined();
	});

	it("extracts modules from the virtual file system", async () => {
		fs.writeFile("./src/foo.ts", 'import { bar } from "./bar";');
		fs.writeFile("./src/bar.ts", "export const bar = 1;");

		builder.build();
		const modules = builder.getModules();
		expect(modules.length).toBe(2);
		expect(modules[0].path).toBe("@/foo");
		expect(modules[1].path).toBe("@/bar");
	});
});
