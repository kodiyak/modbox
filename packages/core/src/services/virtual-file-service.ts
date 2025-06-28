export type VirtualFile =
	| {
			type: "directory";
			directory: {
				[key: string]: VirtualFile;
			};
	  }
	| {
			type: "file";
			content: string;
	  };

export class VirtualFileService {
	private files = new Map<string, VirtualFile>();

	private getFile(path: string): VirtualFile | undefined {
		return this.files.get(path);
	}

	public async readFile(path: string) {
		const file = this.getFile(path);
		return file && file.type === "file" ? file.content : undefined;
	}

	public async writeFile(path: string, content: string): Promise<void> {
		this.files.set(path, {
			type: "file",
			content,
		});
	}

	public async rm(path: string) {
		this.files.delete(path);
	}

	public async mkdir(path: string): Promise<void> {
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
