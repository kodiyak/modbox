import { Modpack } from "@modpack/core";
import { esmSh, inject, resolver, virtual } from "@modpack/plugins";
import { swc } from "@modpack/swc";
import * as React from "react";
import * as DevJSXRuntime from "react/jsx-dev-runtime";
import * as JSXRuntime from "react/jsx-runtime";
import * as ReactDOM from "react-dom/client";

export default function BasicReact() {
	const modpackRef = React.useRef<any | null>(null);
	const load = async () => {
		const modpack = await Modpack.boot({
			debug: true,
			plugins: [
				inject({
					modules: {
						react: React,
						"react/jsx-dev-runtime": DevJSXRuntime,
						"react/jsx-runtime": JSXRuntime,
						"react-dom/client": ReactDOM,
					},
				}),
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
								refresh: true,
							},
						},
					},
					sourceMaps: true,
					module: {
						type: "es6",
						strict: false,
						ignoreDynamic: true,
					},
				}),
				resolver({
					extensions: [".js", ".ts", ".tsx", ".jsx"],
					alias: { "@/": "/src/" },
					index: true,
				}),
				virtual(),
				esmSh({
					registry: "npm",
					external: [
						"react",
						"react/jsx-dev-runtime",
						"react/jsx-runtime",
						"react-dom/client",
					],
				}),
			],
		});
		modpack.fs.writeFile(
			"/main.js",
			`import { createRoot } from 'react-dom/client'
			import 'lucide-react';

			const Application = () => {
				return (
					<div>
						<h1>Count: N/A</h1>
						<h2>This is a basic React Demo Application</h2>
					</div>
				)
			}

      createRoot(document.getElementById('modpackRoot')).render(
        <Application />,
      )`,
		);

		await modpack.mount("/main.js");
		modpackRef.current = modpack;
		console.log("Modpack loaded successfully");
	};

	const updateFile = async () => {
		const path = "/main.js";
		const content = `import { createRoot } from 'react-dom/client'
			import { useState } from 'react';

			const Application = () => {
				const [count, setCount] = useState(0);
				return (
					<div>
						<h1>Count: {count}</h1>
						<h2>This is a basic React Demo Application</h2>
						<button onClick={() => setCount(count + 1)}>Increment</button>
						<button onClick={() => setCount(count - 1)}>Decrement</button>

						<span>This is a new line added to the file.</span>
						<span>Another line added.</span>
						<span>And another one!</span>

						<h3>React fast refresh is enabled!</h3>
					</div>
				)
			}

			createRoot(document.getElementById('modpackRoot')).render(
				<Application />,
			)`;

		modpackRef.current?.fs.writeFile(path, content);
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
			<button
				type={"button"}
				onClick={async () => {
					await updateFile();
				}}
			>
				Editar Aplicação
			</button>
		</div>
	);
}
