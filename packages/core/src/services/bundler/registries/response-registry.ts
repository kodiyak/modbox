import { AbstractBundlerRegistry } from "./bundler-registry";

export class ResponseRegistry extends AbstractBundlerRegistry<
	Response,
	Response
> {
	protected buildRegistry(key: string, item: Response): Response {
		return item;
	}
}
