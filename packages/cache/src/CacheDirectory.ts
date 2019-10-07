import { ConfigDirectory } from '@minepack/config'
import { Directory, Path, PathLike } from '@minepack/fs'

export class CacheDirectory extends Directory {
  static defaultName = 'cache'

  protected constructor(root: string, dir: string, base: string, ext: string, name: string) {
    super(root, dir, base, ext, name)
  }

  static from(pathOrDirectory: PathLike = this.defaultPath): CacheDirectory {
    if (pathOrDirectory instanceof CacheDirectory) {
      return pathOrDirectory
    }
    if (pathOrDirectory instanceof ConfigDirectory) {
      return this.from(pathOrDirectory.resolve(this.defaultName))
    }
    const { root, dir, base, ext, name } = Path.from(pathOrDirectory)
    return new CacheDirectory(root, dir, base, ext, name)
  }

  static get defaultPath(): Path {
    return ConfigDirectory.assumedPath.resolve(this.defaultName)
  }
}
