import { AbstractBundlerRegistry } from "./bundler-registry";

export class ResponseRegistry extends AbstractBundlerRegistry<
	Response,
	Response
> {
	// @ts-expect-error: This is a placeholder for the type, which can be defined later.
	protected buildRegistry(key: string, item: Response): Response {
		return item;
	}
}
