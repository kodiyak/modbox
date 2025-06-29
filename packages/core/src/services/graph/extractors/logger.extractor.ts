import { defineModuleExtractor } from "../utils";

export function createLoggerExtractor() {
	return defineModuleExtractor(
		(props, { logger, dependenciesRegistry, exportsRegistry }) => {
			logger.debug(
				`[LoggerExtractor][${props.node.type}][${props.path}] Processing node...`,
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
