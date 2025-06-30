import { Modbox } from "@modbox/core";

export default function BasicModule() {
	const load = async () => {
		const modbox = await Modbox.boot({
			debug: false,
		});
		modbox.fs.writeFile(
			"/hello.js",
			`export function hello(name) {
				return "Hello, " + name + "!"; 
			}`,
		);
		modbox.fs.writeFile(
			"/index.js",
			`import { hello } from "./hello.js";
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
