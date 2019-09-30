import { ConfigDirectory, Directory } from '@minepack/config'

export class CacheDirectory extends Directory {
  static get defaultPath(): string {
    return new ConfigDirectory().resolve(CacheDirectory.defaultPath)
  }

  constructor(path = CacheDirectory.defaultPath) {
    super(path)
  }
}
