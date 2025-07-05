import { z } from "zod";
import { EventEmitter } from "../../shared";

const PluginReporterEvents = z.object({
	"plugin:log": z.object({
		name: z.string(),
		level: z.enum(["debug", "info", "warn", "error"]),
		message: z.string(),
	}),
});

type PluginReporterEventsProps = z.infer<typeof PluginReporterEvents>;

export type IReportLevel = PluginReporterEventsProps["plugin:log"]["level"];
export interface IPluginReporter {
	log(level: IReportLevel, message: string): void;
}

export class PluginReporter implements IPluginReporter {
	private readonly events: EventEmitter<typeof PluginReporterEvents>;
	private readonly name: string;

	private static reporters: Record<string, PluginReporter> = {};

	constructor(name: string) {
		this.name = name;
		this.events = new EventEmitter(
			PluginReporterEvents,
			`PluginReporter[${name}]`,
		);
	}

	static create(name: string): PluginReporter {
		if (!PluginReporter.reporters[name]) {
			PluginReporter.reporters[name] = new PluginReporter(name);
		}
		return PluginReporter.reporters[name];
	}

	log(
		level: PluginReporterEventsProps["plugin:log"]["level"],
		message: string,
	) {
		this.events.emit("plugin:log", {
			name: this.name,
			level,
			message,
		});
	}

	getEventEmitter() {
		return this.events;
	}
}
