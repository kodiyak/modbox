import { Modpack } from "@modpack/core";
import { resolver, virtual } from "@modpack/plugins";
import { swc } from "@modpack/swc";

export default function DemoTransformer() {
	const load = async () => {
		const modpack = await Modpack.boot({
			debug: false,
			plugins: [
				resolver({
					extensions: [".js", ".ts", ".tsx", ".jsx"],
					alias: { "@/": "/src/" },
					index: true,
				}),
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
			],
		});
		modpack.fs.writeFile(
			"/main.jsx",
			`import { createRoot } from 'react-dom/client'
			import { useState } from 'react';

			const Application = () => {
				const [count, setCount] = useState(0);
				return (
					<div>
						<h1>Count: {count}</h1>
						<button onClick={() => setCount(count + 1)}>Increment</button>
						<button onClick={() => setCount(count - 1)}>Decrement</button>
					</div>
				)
			}

      createRoot(document.getElementById('modpackRoot')).render(
        <Application />,
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
			<div id={"modpackRoot"}></div>
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
