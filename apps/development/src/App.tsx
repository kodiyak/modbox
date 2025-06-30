import { Modbox } from "@modbox/core";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

export default function App() {
	const { useRef } = React;
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
			`import React from "react";
			console.log({ React })
			export function hello() { return "Hello, Modbox!"; }`,
		);

		const module = await modbox.mount("/index.js", {
			inject: { react: React, "react-dom": ReactDOM },
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
					await load();
				}}
			>
				Carregar Módulos
			</button>
			<div ref={containerRef}></div>
		</div>
	);
}
