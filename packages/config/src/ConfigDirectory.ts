import { Directory, Path, PathLike } from '@minepack/fs'

export class ConfigDirectory extends Directory {
  constructor(path: PathLike = ConfigDirectory.assumedPath) {
    super(path)
  }

  static readonly environmentVariable = 'MINEPACK_HOME'

  static get defaultPath(): Path {
    // TODO: Something more Windows-friendly
    return Directory.home().resolve('.config', 'minepack')
  }

  static get pathFromEnv(): Path | undefined {
    const path = process.env[this.environmentVariable]
    return path ? new Path(path) : undefined
  }

  static get assumedPath(): Path {
    return this.pathFromEnv || this.defaultPath
  }
}
