import { Modbox } from "@modbox/core";
import {
	cache,
	external,
	graphBuilder,
	logger,
	resolver,
	virtual,
} from "@modbox/plugins";

export default function BasicModule() {
	const load = async () => {
		const modbox = await Modbox.boot({
			debug: false,
			plugins: [
				graphBuilder(),
				cache(),
				resolver({
					extensions: [".js", ".ts", ".tsx", ".jsx"],
					index: true,
				}),
				external(),
				virtual(),
				logger(),
			],
		});
		modbox.fs.writeFile(
			"/hello.js",
			`export function hello(name) {
				return "Hello, " + name + "!"; 
			}`,
		);
		modbox.fs.writeFile(
			"/index.js",
			`import { hello } from "/hello";
			export function print(name) {
				console.log(hello(name));
			}
			`,
		);

		const { print } = await modbox.mount("/index.js");
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
