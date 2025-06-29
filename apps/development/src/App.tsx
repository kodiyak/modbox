import { Modbox } from "@modbox/core";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

export default function App() {
	const { useRef } = React;
	const MULTIPLIER = 1;
	const containerRef = useRef<HTMLDivElement>(null);
	const load = async () => {
		const modbox = await Modbox.boot({
			debug: true,
		});
		modbox.fs.writeFile(
			"/index.js",
			'import { hello } from "./hello.js";\nconsole.log(hello());',
		);
		modbox.fs.writeFile(
			"/hello.js",
			'export function hello() { return "Hello, Modbox!"; }',
		);

		const m = await modbox.mount("/index.js", {
			inject: {
				react: React,
				"react-dom": ReactDOM,
			},
		});

		console.log(`Module loaded`, m);
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
			<div ref={containerRef}></div>
		</div>
	);
}
