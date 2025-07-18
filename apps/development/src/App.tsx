import { useState } from "react";
import BasicExternal from "./components/demos/basic-external";
import BasicGraph from "./components/demos/basic-graph";
import BasicModule from "./components/demos/basic-module";
import BasicReact from "./components/demos/basic-react";
import BasicResolver from "./components/demos/basic-resolver";
import BasicTwind from "./components/demos/basic-twind";
import BasicUnocss from "./components/demos/basic-unocss";
import DemoAlias from "./components/demos/demo-alias";
import DemoTransformer from "./components/demos/demo-transformer";

export default function App() {
	const [demo, setDemo] = useState(0);
	const demos = [
		{
			label: "Basic Module",
			render: <BasicModule />,
		},
		{
			label: "Resolver",
			render: <BasicResolver />,
		},
		{
			label: "External",
			render: <BasicExternal />,
		},
		{
			label: "Graph",
			render: <BasicGraph />,
		},
		{
			label: "Alias",
			render: <DemoAlias />,
		},
		{
			label: "Transformer",
			render: <DemoTransformer />,
		},
		{
			label: "React",
			render: <BasicReact />,
		},
		{
			label: "Twind",
			render: <BasicTwind />,
		},
		{
			label: "Unocss",
			render: <BasicUnocss />,
		},
	];

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				background: "#000",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				<div style={{ display: "flex", flexDirection: "row" }}>
					{demos.map((demo, index) => (
						<button
							key={demo.label}
							type={"button"}
							onClick={() => setDemo(index)}
						>
							{demo.label}
						</button>
					))}
				</div>

				{demos[demo].render}
			</div>
		</div>
	);
}
