import { Modbox } from "@modbox/core";
import {
	alias,
	cache,
	external,
	graphBuilder,
	logger,
	virtual,
} from "@modbox/plugins";

export default function DemoAlias() {
	const load = async () => {
		const modbox = await Modbox.boot({
			debug: false,
			plugins: [
				alias({
					"@/": "/src/",
				}),
				graphBuilder(),
				cache(),
				logger(),
				external(),
				virtual(),
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
			`import { hello } from "@/hello.js";
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
