import debug, { type Debugger } from "debug";

export class Logger {
	private readonly log: {
		error: Debugger;
		warn: Debugger;
		info: Debugger;
		debug: Debugger;
		trace: Debugger;
	};

	private readonly prefix: string;

	constructor(scope = "default") {
		this.prefix = `modbox:${scope}`;
		const logger = debug(this.prefix);
		this.log = {
			error: logger.extend("error"),
			warn: logger.extend("warn"),
			info: logger.extend("info"),
			debug: logger.extend("debug"),
			trace: logger.extend("trace"),
		};
	}

	static enable(scope: string) {
		return debug.enable(`modbox:${scope}`);
	}

	static create(scope: string = "default"): Logger {
		return new Logger(scope);
	}

	error(message: string, ...args: any[]) {
		this.log.error(`${message}`, ...args);
	}

	warn(message: string, ...args: any[]) {
		this.log.warn(`${message}`, ...args);
	}

	info(message: string, ...args: any[]) {
		this.log.info(`${message}`, ...args);
	}

	debug(message: string, ...args: any[]) {
		this.log.debug(`${message}`, ...args);
	}

	trace(message: string, ...args: any[]) {
		this.log.trace(`${message}`, ...args);
	}

	namespace(namespace: string) {
		return Logger.create(`${this.prefix}:${namespace}`);
	}
}
