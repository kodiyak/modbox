import { useState } from "react";
import BasicModule from "./components/demos/basic-module";
import BasicReact from "./components/demos/basic-react";
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
