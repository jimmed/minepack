import { promises as fs } from 'fs'
import { homedir, tmpdir } from 'os'
import { resolve } from 'path'
import { Path, PathLike } from './Path'

export interface RecursionOptions {
  recursive?: boolean
}

export class Directory extends Path {
  static async create(path: PathLike): Promise<Directory> {
    const dir = new Directory(path)
    await dir.create()
    return dir
  }

  static home(): Directory {
    return new Directory(homedir())
  }

  static tmp(): Directory {
    return new Directory(tmpdir())
  }

  resolve(...pathSegments: string[]): Path {
    return new Path(resolve(this.path, ...pathSegments))
  }

  async create({ recursive = true }: RecursionOptions = {}): Promise<void> {
    await fs.mkdir(this.path, { recursive })
  }

  async delete(): Promise<void> {
    await fs.rmdir(this.path)
  }
}
