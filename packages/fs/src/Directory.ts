import { promises as fs } from 'fs'
import { Path, PathLike } from './Path'

export class Directory extends Path {
  static from(pathOrDirectory: PathLike | Directory): Directory {
    if (pathOrDirectory instanceof Directory) {
      return pathOrDirectory
    }
    const { base, dir, name, root, ext } = Path.from(pathOrDirectory)
    return new Directory(root, dir, base, ext, name)
  }

  static async create(path: PathLike): Promise<Directory> {
    const dir = Directory.from(path)
    await dir.create()
    return dir
  }

  protected constructor(root: string, dir: string, base: string, ext: string, name: string) {
    super(root, dir, base, ext, name)
  }

  async create(): Promise<void> {
    await fs.mkdir(this.toString(), { recursive: true })
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.toString(), 0o755)
      return true
    } catch (error) {
      return false
    }
  }

  async remove(): Promise<void> {
    await fs.rmdir(
      this.toString(),
      // @ts-ignore Experimental feature in node.js 12
      { recursive: true },
    )
  }
}
