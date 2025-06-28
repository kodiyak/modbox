import { beforeEach, describe, expect, it } from "vitest";
import { Logger } from "../../shared";
import { VirtualFiles } from "../virtual-files";
import { GraphBuilder } from "./graph-builder";
import { GraphModule } from "./graph-module";
import type { GraphBuilderOptions } from "./types";

describe("GraphBuilder", () => {
	let logger: Logger;
	let fs: VirtualFiles;
	let options: GraphBuilderOptions;
	let builder: GraphBuilder;

	beforeEach(() => {
		logger = new Logger("debug");
		fs = new VirtualFiles();
		options = {} as GraphBuilderOptions;
		builder = new GraphBuilder(logger, fs, options);
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
});
