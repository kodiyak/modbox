import { Modpack } from "@modpack/core";
import { resolver, virtual } from "@modpack/plugins";

export default function BasicResolver() {
	const loadModules = async () => {
		const modpack = await Modpack.boot({
			debug: true,
			plugins: [
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
			],
		});

		modpack.fs.writeFile(
			"/src/utils/helpers.js",
			`
      export const capitalize = (str) => str.toUpperCase();
      export const sum = (a, b) => a + b;
    `,
		);

		modpack.fs.writeFile(
			"/src/utils/math.js",
			`
      export const multiply = (a, b) => a * b;
    `,
		);

		modpack.fs.writeFile(
			"/src/components/Button.jsx",
			`
      import { capitalize } from '@src/utils/helpers.js'; // Teste de alias com extensão
      export const Button = ({ text }) => console.log('Button clicked:', capitalize(text));
    `,
		);

		modpack.fs.writeFile(
			"/src/components/Input/index.js",
			`
      export const Input = () => console.log('Input component initialized.');
    `,
		);

		modpack.fs.writeFile(
			"/src/components/Header.js",
			`
      export const Header = () => console.log('Header component.');
    `,
		);

		modpack.fs.writeFile(
			"/config/app.json",
			`
      { "appName": "Modpack Demo", "version": "1.0.0" }
    `,
		);

		modpack.fs.writeFile(
			"/package.json",
			`
      { "name": "demo-app", "version": "0.0.1" }
    `,
		);

		modpack.fs.writeFile(
			"/main.js",
			`
      import { capitalize, sum } from '@src/utils/helpers';         // Teste 1: Alias sem extensão
      import { multiply } from '@src/utils/math';                 // Teste 2: Alias com extensão TS
      import { Button } from '@src/components/Button';            // Teste 3: Alias com extensão JSX
      import { Input } from '@src/components/Input';              // Teste 4: Resolução de index.js
      import { Header } from '@src/components/Header.js';         // Teste 5: Alias com extensão explícita
      import config from '@config/app.json';                      // Teste 6: Alias para JSON
      import packageJson from '/package.json';            // Teste 7: Importação de arquivo JSON raiz

      const { name: appName } = packageJson;

      console.log('--- Modpack Resolver Demo ---');
      console.log('Capitalized:', capitalize('hello resolver'));
      console.log('Sum:', sum(5, 3));
      console.log('Multiply:', multiply(4, 2));
      Button({ text: 'My Button' });
      Input();
      Header();
      console.log('App Name from config:', config.appName);
      console.log('Package name:', appName);
    `,
		);

		modpack.fs.writeFile(
			"/dynamic-remote.js",
			`
        export default "This came from a dynamically imported remote module!";
    `,
		);

		console.log("Attempting to mount /main.js...");
		const mainModule = await modpack.mount("/main.js");
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
					console.clear(); // Limpa o console para uma nova execução
					await loadModules();
				}}
			>
				Carregar e Testar Módulos com Resolver
			</button>
		</div>
	);
}
