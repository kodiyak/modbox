import { Modpack } from "@modpack/core";
import { esmSh, http, resolver, virtual } from "@modpack/plugins";
import { swc } from "@modpack/swc";

export default function BasicGraph() {
	const loadModules = async () => {
		const modpack = await Modpack.boot({
			debug: true,
			plugins: [
				swc({
					extensions: [".ts", ".tsx"],
					onTransform: async ({ url, originalContent, transformed }) => {
						console.log(`Transformed: ${url}`);
						console.log("Original Content:", originalContent.length);
						console.log("Transformed Code:", transformed.code.length);
					},
					onParse: async ({ url, originalContent, parsed }) => {
						console.log(`Parsed: ${url}`);
						console.log("Original Content:", originalContent.length);
						console.log("Parsed Module:", parsed);
					},
				}),
				http(),
				resolver({
					extensions: [".js", ".json", ".mjs", ".cjs", ".ts", ".jsx", ".tsx"],
					index: true,
					alias: {
						"@src": "/src",
						"@config": "/config",
						"~": "/src/utils",
					},
				}),
				virtual(),
				esmSh({
					registry: "npm",
				}),
			],
		});

		modpack.fs.writeFile(
			"/main.ts",
			`
			import * as dateFns from 'date-fns';
      console.log("Date:", dateFns.format(new Date(), 'yyyy-MM-dd'));
			console.log("Dynamic import from remote module:", dateFns);
    `,
		);

		console.log("Attempting to mount /main.ts...");
		await modpack.mount("/main.ts");
	};

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				background: "#000",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<button
				type={"button"}
				style={{
					padding: "20px 40px",
					fontSize: "24px",
					cursor: "pointer",
					backgroundColor: "#4CAF50",
					color: "white",
					border: "none",
					borderRadius: "8px",
					boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
					transition: "background-color 0.3s ease",
				}}
				onClick={async () => {
					console.clear();
					await loadModules();
				}}
			>
				Carregar e Testar Módulos com Graph
			</button>
		</div>
	);
}
