import { Modpack } from "@modpack/core";
import { resolver } from "@modpack/plugins";

const sharedModule = `import { hello } from "/index.js";
hello("Shared Module");
`;

export default function BasicMultipleProjects() {
	const loadFirstProject = async () => {
		const orchestrator1 = await Modpack.boot({
			plugins: [
				resolver({
					baseUrl: "/orchestrator1",
					extensions: [".js"],
				}),
			],
		});
		orchestrator1.fs.writeFile(
			"/orchestrator1/index.js",
			"export function hello(msg) { console.log(msg); }",
		);
		orchestrator1.fs.writeFile("/orchestrator1/shared.js", sharedModule);

		await orchestrator1.mount("/orchestrator1/shared.js");
	};

	const loadSecondProject = async () => {
		const orchestrator2 = await Modpack.boot({
			plugins: [
				resolver({
					baseUrl: "/orchestrator2",
					extensions: [".js"],
				}),
			],
		});
		orchestrator2.fs.writeFile(
			"/orchestrator2/index.js",
			"export function hello(msg) { console.log('hello 02 ->' + msg); }",
		);
		orchestrator2.fs.writeFile("/orchestrator2/shared.js", sharedModule);

		await orchestrator2.mount("/orchestrator2/shared.js");
	};

	return (
		<div>
			<button
				type={"button"}
				onClick={async () => {
					await loadFirstProject();
				}}
			>
				Project 01
			</button>
			<button
				type={"button"}
				onClick={async () => {
					await loadSecondProject();
				}}
			>
				Project 02
			</button>
		</div>
	);
}
