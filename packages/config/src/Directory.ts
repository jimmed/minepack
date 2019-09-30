import { promises as fs } from 'fs'
import { resolve as resolvePath } from 'path'

export class Directory {
  constructor(public readonly path: string) {}

  resolve(...paths: string[]): string {
    return resolvePath(this.path, ...paths)
  }

  subdirectory(...childPaths: string[]): Directory {
    return new Directory(this.resolve(...childPaths))
  }

  async create(): Promise<void> {
    await fs.mkdir(this.path, { recursive: true })
  }

  async exists(): Promise<boolean> {
    try {
      fs.access(this.path, 0o755)
      return true
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  async remove(): Promise<void> {
    await fs.rmdir(
      this.path,
      // @ts-ignore Experimental feature in node.js 12
      { recursive: true },
    )
  }
}
