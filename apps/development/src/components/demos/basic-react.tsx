import { Modbox } from "@modbox/core";

export default function BasicReact() {
	const load = async () => {
		const modbox = await Modbox.boot({
			debug: true,
		});
		modbox.fs.writeFile(
			"/main.jsx",
			`import { createRoot } from 'react-dom/client'
      createRoot(document.getElementById('modboxRoot')).render(
        <div>React ELEMENT</div>,
      )`,
		);

		await modbox.mount("/main.jsx");
	};

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				background: "#000",
			}}
		>
			<div id={"modboxRoot"}>Waiting Component...</div>
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
