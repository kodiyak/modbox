interface VirtualDir {
	type: "directory";
	directory: Record<string, VirtualItem>;
}
type VirtualFile = {
	type: "file";
	content: string;
};
export type VirtualItem = VirtualDir | VirtualFile;

export class VirtualFiles {
	private files = new Map<string, VirtualItem>();

	private getFile(path: string): VirtualItem | undefined {
		return this.files.get(path);
	}

	public readFile(path: string) {
		const file = this.getFile(path);
		return file && file.type === "file" ? file.content : undefined;
	}

	public writeFile(path: string, content: string): void {
		this.files.set(path, {
			type: "file",
			content,
		});
	}

	public rm(path: string) {
		this.files.delete(path);
	}

	public mkdir(path: string): void {
		this.files.set(path, {
			type: "directory",
			directory: {},
		});
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
