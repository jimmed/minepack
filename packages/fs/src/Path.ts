import { promises as fs } from 'fs'
import { format, parse, ParsedPath, resolve } from 'path'

export type PathLike = Path | ParsedPath | string

/**
 * Provides filesystem path resolution methods, as well as a base class for files and directories
 */
export class Path implements ParsedPath {
  private readonly parsedPath: ParsedPath

  constructor(path: PathLike) {
    if (typeof path === 'string') {
      this.parsedPath = parse(path)
    } else {
      this.parsedPath = path
    }
  }

  get path(): string {
    return this.toString()
  }
  get base(): string {
    return this.parsedPath.base
  }
  get dir(): string {
    return this.parsedPath.dir
  }
  get ext(): string {
    return this.parsedPath.ext
  }
  get name(): string {
    return this.parsedPath.name
  }
  get root(): string {
    return this.parsedPath.root
  }

  toString(): string {
    return format(this.parsedPath)
  }

  toJSON(): ParsedPath {
    const { base, dir, ext, name, root } = this
    return { base, dir, ext, name, root }
  }

  resolve(...pathSegments: string[]): Path {
    return new Path(resolve(this.dir, ...pathSegments))
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
