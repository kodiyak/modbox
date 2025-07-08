import { Logger, PluginReporter } from "@modpack/core/__internal-tests";
import { inject } from "@modpack/plugins";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("inject plugin", () => {
	let logger: ReturnType<typeof Logger.create>;
	let next: ReturnType<typeof vi.fn>;
	let reporter: ReturnType<typeof PluginReporter.create>;
	let self: Record<string, any> = {};

	beforeEach(() => {
		logger = Logger.create("inject-test");
		reporter = PluginReporter.create("inject-test");
		next = vi.fn();
		self = {};
	});

	const runResolve = (
		modules: Record<string, any>,
		path: string,
		globalKey?: string,
	) => {
		const plugin = inject({ modules, globalKey });
		return plugin.pipeline?.resolver?.resolve?.({
			path,
			parent: "",
			logger,
			next,
			registry: {},
			reporter,
		});
	};

	const runFetch = async (modules: Record<string, any>, url: string) => {
		const plugin = inject({ modules });
		return await plugin.pipeline?.fetcher?.fetch?.({
			url,
			next,
			logger,
			reporter,
			path: url,
		});
	};

	it("should resolve internal module path", () => {
		const modules = { lodash: { map: () => {} } };
		runResolve(modules, "lodash");
		expect(next).toHaveBeenCalledWith({
			path: "internal://lodash",
			parent: "",
		});
	});

	it("should call next with no args if module is not matched", () => {
		const modules = { axios: { get: () => {} } };
		runResolve(modules, "react");
		expect(next).toHaveBeenCalledWith();
	});

	it("should use custom globalKey", async () => {
		const modules = { react: { useState: () => {}, useEffect: () => {} } };
		const plugin = inject({ modules, globalKey: "__CUSTOM_KEY__", self });
		expect(await plugin.onBoot?.());

		expect(self.__CUSTOM_KEY__).toEqual(modules);
	});

	it("should throw if not in browser environment", async () => {
		const plugin = inject({
			modules: { foo: {} },
			self: null as any,
		});

		await expect(async () => await plugin.onBoot?.()).rejects.toThrow(
			"Inject plugin can only be used in a browser environment.",
		);
	});

	it("should inject module into self[globalKey]", async () => {
		const modules = { react: { useState: () => {} } };
		globalThis.self = {} as any;

		const plugin = inject({ modules, self: globalThis.self });
		await plugin.onBoot?.();

		expect((globalThis.self as any).__MODPACK_INJECT__).toEqual(modules);
	});

	it("should generate correct JS from internal:// fetch", async () => {
		const useState = () => {};
		const useEffect = () => {};
		const modules = { react: { useState, useEffect, _internal: "hidden" } };

		globalThis.self = {
			__MODPACK_INJECT__: modules,
		} as any;

		const res = await runFetch(modules, "internal://react");
		const text = await res?.text();

		expect(text).toContain(`const mod = self['__MODPACK_INJECT__']['react']`);
		expect(text).toContain(`export { mod as default };`);
		expect(text).toContain(`export const useState = mod['useState']`);
		expect(text).toContain(`export const useEffect = mod['useEffect']`);
		expect(text).not.toContain(`_internal`);
		expect(res?.headers.get("Content-Type")).toBe("application/javascript");
	});

	it("should call next() when fetching non-internal url", async () => {
		const modules = { lodash: { map: () => {} } };
		await runFetch(modules, "https://cdn.skypack.dev/lodash");
		expect(next).toHaveBeenCalled();
	});

	it("should support multiple modules", () => {
		const modules = {
			react: { useState: () => {} },
			lodash: { map: () => {} },
		};

		runResolve(modules, "lodash");
		expect(next).toHaveBeenCalledWith({
			path: "internal://lodash",
			parent: "",
		});
	});
});
