import { defineModuleExtractor } from "../utils";

export function createLoggerExtractor() {
	return defineModuleExtractor(
		(props, { logger, dependenciesRegistry, exportsRegistry }) => {
			logger.debug(
				`Processing node type "${props.node.type}" for path "${props.path}"...`,
				{
					...props,
					dependencies: dependenciesRegistry.getAll(),
					exported: exportsRegistry.getAll(),
				},
			);

			return {
				dependencies: [],
				exported: [],
				warnings: [],
			};
		},
	);
}
