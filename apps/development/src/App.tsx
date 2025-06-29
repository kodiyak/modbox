import { Modbox } from "@modbox/core";

export default function App() {
	const load = async () => {
		const modbox = await Modbox.boot({});
		modbox.fs.writeFile(
			"/index.js",
			'import { hello } from "./hello.js";\nconsole.log(hello());',
		);
		modbox.fs.writeFile(
			"/hello.js",
			'export function hello() { return "Hello, Modbox!"; }',
		);

		await modbox.mount();

		console.log("Modbox initialized successfully", { modbox });
	};

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				background: "#000",
			}}
		>
			<button type={"button"} onClick={load}>
				Carregar Módulos
			</button>
		</div>
	);
}
