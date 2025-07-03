import { z } from "zod";
import { EventEmitter } from "./event-emitter";
import type { Logger } from "./logger";

interface VirtualDir {
	type: "directory";
	directory: Record<string, VirtualItem>;
}
type VirtualFile = {
	type: "file";
	content: string;
};
export type VirtualItem = VirtualDir | VirtualFile;

const VirtualFilesEvents = z.object({
	"file:created": z.object({
		path: z.string(),
		content: z.string().optional(),
	}),
	"file:removed": z.object({
		path: z.string(),
	}),
	"file:updated": z.object({
		path: z.string(),
		content: z.string(),
	}),
	"directory:created": z.object({
		path: z.string(),
	}),
});

export class VirtualFiles {
	private files = new Map<string, VirtualItem>();
	private events: EventEmitter<typeof VirtualFilesEvents>;

	constructor(logger: Logger) {
		this.events = new EventEmitter(VirtualFilesEvents, "VirtualFiles");
		this.events.on("file:created", (data) =>
			logger.info(`File created: ${data.path}`),
		);
		this.events.on("file:removed", (data) =>
			logger.info(`File removed: ${data.path}`),
		);
		this.events.on("file:updated", (data) =>
			logger.info(`File updated: ${data.path}`),
		);
		this.events.on("directory:created", (data) =>
			logger.info(`Directory created: ${data.path}`),
		);
	}

	private getFile(path: string): VirtualItem | undefined {
		return this.files.get(path);
	}

	public readFile(path: string) {
		const file = this.getFile(path);
		return file && file.type === "file" ? file.content : undefined;
	}

	public writeFile(path: string, content: string): void {
		const exists = this.getFile(path);
		this.files.set(path, { type: "file", content });

		if (exists) {
			this.events.emit("file:updated", { path, content });
		} else {
			this.events.emit("file:created", { path, content });
		}
	}

	public rm(path: string) {
		this.files.delete(path);
		this.events.emit("file:removed", { path });
	}

	public mkdir(path: string): void {
		this.files.set(path, {
			type: "directory",
			directory: {},
		});
		this.events.emit("directory:created", { path });
	}

	public readdir() {
		const directories: string[] = [];
		const files: string[] = [];

		for (const [path, file] of this.files.entries()) {
			if (file.type === "directory") {
				directories.push(path);
			} else if (file.type === "file") {
				files.push(path);
			}
		}

		return { directories, files };
	}
}
