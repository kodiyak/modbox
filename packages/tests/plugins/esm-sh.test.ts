import {
	BundlerRegistry,
	Logger,
	PluginReporter,
} from "@modpack/core/__internal-tests";
import { type EsmShOptions, esmSh } from "@modpack/plugins";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("esmSh plugin", () => {
	let logger: ReturnType<typeof Logger.create>;
	let next: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		logger = Logger.create("esmsh-test");
		next = vi.fn();
	});

	const runPlugin = (
		pluginOptions: EsmShOptions,
		path: string,
		parent = "",
	) => {
		const plugin = esmSh(pluginOptions);
		return plugin.pipeline?.resolver?.resolve?.({
			path,
			parent,
			logger,
			next,
			registry: BundlerRegistry.create({} as any),
			reporter: PluginReporter.create("esmsh-test"),
		});
	};

	it("should skip resolution if path is a URL", () => {
		runPlugin({}, "react");

		expect(next).toHaveBeenCalledWith({
			path: "https://esm.sh/react",
			parent: "",
		});
	});

	it("should skip if module is in external list", () => {
		runPlugin({ external: ["react"] }, "react");

		expect(next).toHaveBeenCalledWith();
	});

	it("should add external query param if configured", () => {
		runPlugin({ external: ["react", "react-dom"] }, "date-fns");

		const path = new URL("date-fns", "https://esm.sh/");
		path.searchParams.set("external", "react,react-dom");
		expect(next).toHaveBeenCalledWith({
			path: path.toString(),
			parent: "",
		});
	});

	it("should resolve scoped package with version", () => {
		runPlugin({}, "@modular/core@1.0.2");

		expect(next).toHaveBeenCalledWith({
			path: "https://esm.sh/@modular/core@1.0.2",
			parent: "",
		});
	});

	it("should resolve using registry 'jsr'", () => {
		runPlugin({ registry: "jsr" }, "std/assert");

		expect(next).toHaveBeenCalledWith({
			path: "https://esm.sh/jsr/std/assert",
			parent: "",
		});
	});

	it("should resolve using registry 'github'", () => {
		runPlugin({ registry: "github" }, "user/repo");

		expect(next).toHaveBeenCalledWith({
			path: "https://esm.sh/gh/user/repo",
			parent: "",
		});
	});

	it("should resolve using registry 'pr'", () => {
		runPlugin({ registry: "pr" }, "some-lib");

		expect(next).toHaveBeenCalledWith({
			path: "https://esm.sh/pr/some-lib",
			parent: "",
		});
	});

	it("should resolve relative path with parent URL", () => {
		runPlugin({}, "./utils/index.ts", "https://esm.sh/app/main.ts");

		expect(next).toHaveBeenCalledWith({
			path: "https://esm.sh/app/utils/index.ts",
			parent: "https://esm.sh/app/main.ts",
		});
	});

	it("should resolve relative path with parent URL 2", () => {
		// const parent =
		// 	"https://esm.sh/date-fns@4.1.0/X-ZWNsYXNzLXZhcmlhbmNlLWF1dGhvcml0eSxjbHN4LG1vdGlvbixtb3Rpb24vcmVhY3QsbW90aW9uL3JlYWN0LWNsaWVudCxtb3Rpb24vcmVhY3QtbSxtb3Rpb24vcmVhY3QtbWluaSxyZWFjdCxyZWFjdC1kb20scmVhY3QvanN4LWRldi1ydW50aW1lLHJlYWN0L2pzeC1ydW50aW1lLHRhaWx3aW5kLW1lcmdl/es2022";
		const parent =
			"https://esm.sh/date-fns@4.1.0/X-ZWNsYXNzLXZhcmlhbmNlLWF1dGhvcml0eSxjbHN4LG1vdGlvbixtb3Rpb24vcmVhY3QsbW90aW9uL3JlYWN0LWNsaWVudCxtb3Rpb24vcmVhY3QtbSxtb3Rpb24vcmVhY3QtbWluaSxyZWFjdCxyZWFjdC1kb20scmVhY3QvanN4LWRldi1ydW50aW1lLHJlYWN0L2pzeC1ydW50aW1lLHRhaWx3aW5kLW1lcmdl/es2022";
		const external = [
			"react",
			"react-dom",
			"react/jsx-dev-runtime",
			"react/jsx-runtime",
			"motion",
			"motion/react",
			"motion/react-client",
			"motion/react-m",
			"motion/react-mini",
			"clsx",
			"class-variance-authority",
			"tailwind-merge",
		];
		const parentUrl = new URL(`${parent}/add.mjs`);
		parentUrl.searchParams.set("external", external.join(","));
		runPlugin({ external }, "./addDays.mjs", parentUrl.toString());

		const expectedPath = new URL(`${parent}/addDays.mjs`);
		expectedPath.searchParams.set("external", external.join(","));

		expect(next).toHaveBeenCalledWith({
			path: expectedPath.toString(),
			parent: parentUrl.toString(),
		});
	});

	it("should resolve ../ paths from parent correctly", () => {
		runPlugin({}, "../shared/util.ts", "https://esm.sh/app/module.ts");

		expect(next).toHaveBeenCalledWith({
			path: "https://esm.sh/shared/util.ts",
			parent: "https://esm.sh/app/module.ts",
		});
	});

	it("should return original path if parent is not URL for relative paths", () => {
		runPlugin({}, "./x.ts", "/local/file.ts");
		expect(next).toHaveBeenCalledWith();
	});
});
