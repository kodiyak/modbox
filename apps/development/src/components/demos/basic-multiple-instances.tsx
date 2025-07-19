import { Modpack } from "@modpack/core";
import { resolver, virtual } from "@modpack/plugins";

export default function BasicMultipleInstances() {
	const load = async () => {
		const orchestrator1 = await Modpack.boot({
			plugins: [virtual(), resolver()],
		});
		orchestrator1.fs.writeFile("/fake.js", "console.log('orchestrator 1');");

		const orchestrator2 = await Modpack.boot({
			plugins: [virtual(), resolver()],
		});
		orchestrator2.fs.writeFile("/main.js", "console.log('orchestrator 2');");

		await Promise.all([
			orchestrator1.mount("file:///fake.js"),
			orchestrator2.mount("file:///main.js"),
		]);
	};

	return (
		<div>
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
