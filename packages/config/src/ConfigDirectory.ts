import { homedir } from 'os'
import { resolve as resolvePath } from 'path'
import { Directory, PathLike, Path } from '@minepack/fs'

export class ConfigDirectory extends Directory {
  protected constructor(root: string, dir: string, base: string, ext: string, name: string) {
    super(root, dir, base, ext, name)
  }

  static from(path: PathLike = this.assumedPath) {
    if (path instanceof ConfigDirectory) {
      return path
    }
    const { root, dir, base, ext, name } = Path.from(path)
    return new ConfigDirectory(root, dir, base, ext, name)
  }

  static readonly environmentVariable = 'MINEPACK_HOME'

  static get defaultPath(): Path {
    // TODO: Something more Windows-friendly
    return Path.from(resolvePath(homedir(), '.config', 'minepack'))
  }

  static get pathFromEnv(): Path | undefined {
    const path = process.env[this.environmentVariable]
    return path ? Path.from(path) : undefined
  }

  static get assumedPath(): Path {
    return this.pathFromEnv || this.defaultPath
  }
}
