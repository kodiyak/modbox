import init, { transform } from "@swc/wasm-web";

export default function App() {
	const load = async () => {
		console.log("Modbox initialized:", {
			init,
			transform,
		});
		await init();
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
