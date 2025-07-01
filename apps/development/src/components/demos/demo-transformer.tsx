import { Modbox } from "@modbox/core";
import {
	cache,
	graphBuilder,
	logger,
	resolver,
	swc,
	virtual,
} from "@modbox/plugins";

export default function DemoTransformer() {
	const load = async () => {
		const modbox = await Modbox.boot({
			debug: false,
			plugins: [
				resolver({
					extensions: [".js", ".ts", ".tsx", ".jsx"],
					alias: { "@/": "/src/" },
					index: true,
				}),
				cache(),
				virtual(),
				swc({
					extensions: [".js", ".ts", ".tsx", ".jsx"],
					jsc: {
						target: "es2022",
						parser: {
							syntax: "typescript",
							tsx: true,
						},
						transform: {
							legacyDecorator: true,
							decoratorMetadata: true,
							react: {
								throwIfNamespace: false,
								development: true,
								runtime: "automatic",
								refresh: {
									refreshReg: "self.$RefreshReg$",
									refreshSig: "self.$RefreshSig$",
									emitFullSignatures: true,
								},
							},
						},
					},
					sourceMaps: true,
					module: {
						type: "es6",
						strict: false,
						ignoreDynamic: true,
						importInterop: "swc",
					},
				}),
				graphBuilder(),
				logger(),
			],
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
