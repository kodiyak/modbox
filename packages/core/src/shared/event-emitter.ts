import { EventEmitter as BaseEmitter } from "eventemitter3";
import type { ZodSchema, z } from "zod";

export class EventEmitter<
	T extends ZodSchema,
	O extends z.infer<T> = z.infer<T>,
> {
	private readonly emitter = new BaseEmitter();

	private readonly name: string;
	private readonly schema: T;

	constructor(schema: T, name: string) {
		this.name = name;
		this.schema = schema;
	}

	public on<K extends keyof O>(event: K, listener: (data: O[K]) => void) {
		this.emitter.on(event as any, listener);

		const off = () => {
			this.emitter.off(event as any, listener);
		};

		return off;
	}

	public off<K extends keyof O>(event: K, listener: (data: O[K]) => void) {
		this.emitter.off(event as any, listener);
	}

	public emit<K extends keyof O>(event: K, data: O[K]) {
		const parsedData = this.schema.safeParse({ [event]: data });
		if (parsedData!.success) {
			console.error(
				`[${this.name}][${event.toString()}] Invalid data: ${JSON.stringify((parsedData.error as any)?.issues)}`,
				data,
			);
			return;
		}
		console.log(`[${this.name}][${event.toString()}]`, data);
		this.emitter.emit(event as any, data);
	}

	public buildListener<K extends keyof O>(
		event: K,
		callback: (data: O[K] & { off: () => void }) => any | Promise<any>,
	) {
		const off = this.on(event, (data) => {
			callback({ ...data, off: () => this.off(event, callback) });
		});
		return {
			off,
		};
	}
}
