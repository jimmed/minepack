import { ConfigDirectory } from '@minepack/config'
import { Directory, Path, PathLike } from '@minepack/fs'

export class CacheDirectory extends Directory {
  static defaultName = 'cache'

  constructor(path: PathLike = CacheDirectory.defaultPath) {
    super(path)
  }

  static get defaultPath(): Path {
    return ConfigDirectory.assumedPath.resolve(this.defaultName)
  }
}
