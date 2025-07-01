import { Modpack } from "@modpack/core";
import {
	cache,
	graphBuilder,
	logger,
	resolver,
	virtual,
} from "@modpack/plugins";

export default function DemoAlias() {
	const load = async () => {
		const modpack = await Modpack.boot({
			debug: false,
			plugins: [
				graphBuilder(),
				resolver({
					extensions: [".js", ".ts", ".tsx", ".jsx"],
					alias: { "@/": "/src/" },
					index: true,
				}),
				cache(),
				virtual(),
				logger(),
			],
		});
		modpack.fs.writeFile(
			"/src/hello.js",
			`export function hello(name) {
        return "Hello, " + name + "!"; 
      }`,
		);
		modpack.fs.writeFile(
			"/src/index.js",
			`import { hello } from "@/hello";
      export function print(name) {
        console.log(hello(name));
      }
      `,
		);

		const { print } = await modpack.mount("/src/index.js");
		print("Modpack");
	};

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				background: "#000",
			}}
		>
			<button
				type={"button"}
				onClick={async () => {
					await load();
				}}
			>
				Carregar Módulos
			</button>
		</div>
	);
}
