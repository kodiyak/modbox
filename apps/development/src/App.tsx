import { Modbox } from "@modbox/core";

export default function App() {
	const load = () => {
		const modbox = Modbox.boot({
			debug: true,
			graphOptions: {
				basePath: ".",
				aliasMap: {
					"@/*": "./src/*",
				},
			},
		});

		console.log("Modbox initialized:", modbox);
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
