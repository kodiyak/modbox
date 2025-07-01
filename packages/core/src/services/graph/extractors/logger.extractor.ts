import { defineModuleExtractor } from "../utils";

export function createLoggerExtractor() {
	return defineModuleExtractor((props) => {
		const { logger, dependencies, exports } = props;
		logger.debug(
			`Processing node type "${props.node.type}" for path "${props.path}"...`,
			{
				...props,
				dependencies: dependencies.getAll(),
				exported: exports.getAll(),
			},
		);

		return {
			dependencies: [],
			exported: [],
			warnings: [],
		};
	});
}
