type DebugLevel = "none" | "error" | "warn" | "info" | "debug" | "trace";

export class Logger {
	private readonly debugLevel: DebugLevel;

	constructor(debugLevel: DebugLevel = "none") {
		this.debugLevel = debugLevel;
	}

	private shouldLog(level: number): boolean {
		const levels = {
			none: 0,
			error: 1,
			warn: 2,
			info: 3,
			debug: 4,
			trace: 5,
		};
		return levels[this.debugLevel] >= level;
	}

	error(message: string, ...args: any[]) {
		if (this.shouldLog(1)) console.error(`[Modbox][ERROR] ${message}`, ...args);
	}

	warn(message: string, ...args: any[]) {
		if (this.shouldLog(2)) console.warn(`[Modbox][WARN] ${message}`, ...args);
	}

	info(message: string, ...args: any[]) {
		if (this.shouldLog(3)) console.info(`[Modbox][INFO] ${message}`, ...args);
	}

	debug(message: string, ...args: any[]) {
		if (this.shouldLog(4)) console.debug(`[Modbox][DEBUG] ${message}`, ...args);
	}

	trace(message: string, ...args: any[]) {
		if (this.shouldLog(5)) console.trace(`[Modbox][TRACE] ${message}`, ...args);
	}
}
