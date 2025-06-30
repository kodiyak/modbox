import type {
	BlobsRegistry,
	ExternalRegistry,
	GraphRegistry,
	ModulesRegistry,
	ResponseRegistry,
} from "./registries";

interface _Registries {
	// blobs: BlobsRegistry;
	// graph: GraphRegistry;
	// modules: ModulesRegistry;
	external: ExternalRegistry; // todo: use to registry external graph modules
	responses: ResponseRegistry;
}

export class BundlerRegistry {
	private readonly _registries: _Registries;

	constructor(registries: _Registries) {
		this._registries = registries;
	}

	static create(registries: _Registries) {
		return new BundlerRegistry(registries);
	}

	get<K extends keyof _Registries>(key: K): _Registries[K] {
		if (!(key in this._registries)) {
			throw new Error(`Registry "${key}" does not exist.`);
		}

		return this._registries[key];
	}
}
