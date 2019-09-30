import { homedir } from 'os'
import { resolve as resolvePath } from 'path'
import { Directory } from './Directory'

export class ConfigDirectory extends Directory {
  static readonly environmentVariable = 'MINEPACK_HOME'

  static get defaultPath(): string {
    // TODO: Something more Windows-friendly
    return resolvePath(homedir(), '.config', 'minepack')
  }

  static get pathFromEnv(): string | undefined {
    return process.env[this.environmentVariable]
  }

  static get assumedPath(): string {
    return this.pathFromEnv || this.defaultPath
  }

  constructor(path = ConfigDirectory.assumedPath) {
    super(path)
  }
}
