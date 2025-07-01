/**
 * This is an AI provided code snippet for a Modbox plugin that renders React components.
 * It is designed to be used within the Modbox framework, allowing you to render React components
 */
// @modbox/plugin-react-renderer.ts

import type { RuntimePluginContext } from "@modbox/core/types"; // Ajuste conforme seus tipos
import { definePlugin } from "@modbox/utils";
import type React from "react"; // Importa apenas os tipos de React
import type ReactDOM from "react-dom/client"; // Importa apenas os tipos de ReactDOM

// Definimos o que o plugin precisa receber do ambiente externo (sua app host)
interface ReactRendererPluginOptions {
	containerRef: React.RefObject<HTMLElement>; // A ref do elemento DOM onde o componente será renderizado
	react: typeof React; // A instância do React da sua app host
	reactDOM: typeof ReactDOM; // A instância do ReactDOM da sua app host
	rootExportName?: string; // Opcional: nome da exportação do componente raiz (default por padrão)
}

export function reactRendererPlugin(options: ReactRendererPluginOptions) {
	const { containerRef, react, reactDOM, rootExportName = "default" } = options;
	let reactRoot: ReactDOM.Root | null = null; // Para gerenciar a raiz do React

	return definePlugin({
		name: "react-renderer",
		runtime: {
			// Este hook é disparado após um módulo ser executado e suas exports estarem disponíveis
			onModuleExecuted: (
				{ moduleExports, path }: { moduleExports: any; path: string },
				{ logger }: RuntimePluginContext,
			) => {
				if (!containerRef.current) {
					logger.warn(
						`[ReactRenderer]: No container element found for React root.`,
					);
					return;
				}

				const RootComponent = moduleExports[rootExportName];

				if (
					!RootComponent ||
					(typeof RootComponent !== "function" &&
						typeof RootComponent !== "object")
				) {
					logger.warn(
						`[ReactRenderer]: No valid React component found as '${rootExportName}' export in ${path}.`,
					);
					return;
				}

				try {
					// Se não houver uma raiz React, cria uma
					if (!reactRoot) {
						reactRoot = reactDOM.createRoot(containerRef.current);
						logger.debug(
							`[ReactRenderer]: Created new React root in container.`,
						);
					}

					// Renderiza ou atualiza o componente
					logger.debug(
						`[ReactRenderer]: Rendering component '${rootExportName}' from ${path}.`,
					);
					reactRoot.render(
						react.createElement(RootComponent), // Crie o elemento React
					);
				} catch (error) {
					logger.error(
						`[ReactRenderer ERROR]: Failed to render component from ${path}:`,
						error,
					);
				}
			},
			// Um hook de inicialização do plugin para injetar React e ReactDOM
			// Supondo que o Modbox.core tenha um serviço ou método para "injetáveis"
			onSetup: ({
				logger,
				inject,
			}: RuntimePluginContext & {
				inject: (key: string, value: any) => void;
			}) => {
				// Supondo 'inject' é injetado no contexto
				logger.debug(
					"[ReactRenderer]: Setting up React and ReactDOM injectables.",
				);
				// Injeta as instâncias de React e ReactDOM para que os módulos do Modbox possam importá-las
				inject("react", react);
				inject("react-dom/client", reactDOM); // Ou apenas 'react-dom' se for o caso
				// Se precisar de APIs específicas como 'ReactDOM.createRoot', injete separadamente
				inject("react-dom/createRoot", reactDOM.createRoot);
			},
			// Hook para lidar com o unmount, se necessário (ex: ao trocar de módulo ou desligar Modbox)
			onTeardown: ({ logger }: RuntimePluginContext) => {
				if (reactRoot) {
					logger.debug("[ReactRenderer]: Unmounting React root.");
					reactRoot.unmount();
					reactRoot = null;
				}
			},
		},
	});
}
