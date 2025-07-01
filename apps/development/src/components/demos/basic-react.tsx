import { Modpack } from "@modpack/core";

export default function BasicReact() {
	const load = async () => {
		const modpack = await Modpack.boot({
			debug: true,
		});
		modpack.fs.writeFile(
			"/main.jsx",
			`import { createRoot } from 'react-dom/client'
      createRoot(document.getElementById('modpackRoot')).render(
        <div>React ELEMENT</div>,
      )`,
		);

		await modpack.mount("/main.jsx");
	};

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				background: "#000",
			}}
		>
			<div id={"modpackRoot"}>Waiting Component...</div>
			<button
				type={"button"}
				onClick={async () => {
					await load();
				}}
			>
				Carregar React
			</button>
		</div>
	);
}
