import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileService } from './virtual-file-service';

describe('VirtualFileService', () => {
  let vfs: VirtualFileService;

  beforeEach(() => {
    vfs = new VirtualFileService();
  });

  it('should write and read a file', async () => {
    await vfs.writeFile('/foo.txt', 'hello');
    const content = await vfs.readFile('/foo.txt');
    expect(content).toBe('hello');
  });

  it('should return undefined for non-existent file', async () => {
    const content = await vfs.readFile('/notfound.txt');
    expect(content).toBeUndefined();
  });

  it('should remove a file', async () => {
    await vfs.writeFile('/bar.txt', 'test');
    const initialContent = await vfs.readFile('/bar.txt');
    await vfs.rm('/bar.txt');
    const content = await vfs.readFile('/bar.txt');
    expect(content).toBeUndefined();
    expect(initialContent).toBe('test');
  });

  it('should create a directory', async () => {
    await vfs.mkdir('/mydir');
    const { directories, files } = vfs.readdir();
    expect(directories).toContain('/mydir');
    expect(files).not.toContain('/mydir');
  });

  it('should list files and directories correctly', async () => {
    await vfs.mkdir('/dir1');
    await vfs.writeFile('/file1.txt', 'abc');
    const { directories, files } = vfs.readdir();
    expect(directories).toContain('/dir1');
    expect(files).toContain('/file1.txt');
  });
});