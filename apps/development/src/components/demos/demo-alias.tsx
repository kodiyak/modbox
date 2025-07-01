import { Modbox } from "@modbox/core";
import {
	cache,
	graphBuilder,
	logger,
	resolver,
	virtual,
} from "@modbox/plugins";

export default function DemoAlias() {
	const load = async () => {
		const modbox = await Modbox.boot({
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
		modbox.fs.writeFile(
			"/src/hello.js",
			`export function hello(name) {
        return "Hello, " + name + "!"; 
      }`,
		);
		modbox.fs.writeFile(
			"/src/index.js",
			`import { hello } from "@/hello";
      export function print(name) {
        console.log(hello(name));
      }
      `,
		);

		const { print } = await modbox.mount("/src/index.js");
		print("Modbox");
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
