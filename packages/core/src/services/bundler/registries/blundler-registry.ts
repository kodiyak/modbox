import type { Logger } from "../../../shared";

export abstract class BundlerRegistry<TData, TRegistry> {
	protected items: Map<string, TRegistry> = new Map();
	protected logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	register(key: string, item: TData): void {
		if (this.items.has(key)) {
			this.logger.warn(
				`[BundlerRegistry] Item with key "${key}" is already registered.`,
			);
			return;
		}
		const registry = this.buildRegistry(key, item);
		this.items.set(key, registry);
	}

	get(key: string): TRegistry | undefined {
		return this.items.get(key);
	}

	has(key: string): boolean {
		return this.items.has(key);
	}

	clear(): void {
		this.items.clear();
	}

	protected abstract buildRegistry(key: string, item: TData): TRegistry;
}
