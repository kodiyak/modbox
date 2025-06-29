import { Modbox } from "@modbox/core";

export default function App() {
	const MULTIPLIER = 1;
	const load = async () => {
		const modbox = await Modbox.boot({ debug: false });
		modbox.fs.writeFile(
			"/index.js",
			'import { hello } from "./hello.js";\nconsole.log(hello());',
		);
		modbox.fs.writeFile(
			"/hello.js",
			'export function hello() { return "Hello, Modbox!"; }',
		);

		await modbox.mount();

		console.log("Modbox initialized successfully", {
			modbox,
			modules: modbox.graph.getModules().map((m) => m.toJSON()),
		});
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
					const start = Date.now();
					for (const i of Array.from({ length: MULTIPLIER })) {
						await load();
					}
					const end = Date.now();
					console.log(
						[`Loaded ${MULTIPLIER} modules in ${end - start}ms`].join("\n"),
					);
				}}
			>
				Carregar Módulos
			</button>
		</div>
	);
}
