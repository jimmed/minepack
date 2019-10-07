import { ParsedPath, resolve, format, parse } from 'path'
import { promises as fs } from 'fs'

export type PathLike = Path | ParsedPath | string

export class Path implements ParsedPath {
  static from(path: PathLike): Path {
    if (path instanceof Path) {
      return path
    }
    if (typeof path === 'string') {
      return this.fromString(path)
    }
    return this.fromObject(path)
  }

  static fromString(path: string): Path {
    return this.fromObject(parse(path))
  }

  static fromObject({ root, dir, base, ext, name }: ParsedPath): Path {
    return new Path(root, dir, base, ext, name)
  }

  protected constructor(
    readonly root: string,
    readonly dir: string,
    readonly base: string,
    readonly ext: string,
    readonly name: string,
  ) {}

  toString(): string {
    return format(this)
  }

  resolve(...pathSegments: string[]): Path {
    return Path.from(resolve(this.path, ...pathSegments))
  }

  get path(): string {
    return this.toString()
  }

  async exists({ mode, quiet = true }: { mode?: number; quiet?: boolean } = {}): Promise<boolean> {
    try {
      await fs.access(this.path, mode)
      return true
    } catch (error) {
      if (!quiet) {
        throw error
      }
      return false
    }
  }
}
