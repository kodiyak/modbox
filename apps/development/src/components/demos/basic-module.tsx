import { Modpack } from "@modpack/core";
import { virtual } from "@modpack/plugins";

export default function BasicModule() {
	const load = async () => {
		const modpack = await Modpack.boot({
			debug: false,
			plugins: [virtual()],
		});
		modpack.fs.writeFile(
			"/hello.js",
			`export function hello(name) {
				return "Hello, " + name + "!"; 
			}`,
		);
		modpack.fs.writeFile(
			"/index.js",
			`import { hello } from "/hello.js";
			export function print(name) {
				console.log(hello(name));
			}
			`,
		);

		const { print } = await modpack.mount("/index.js");
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
