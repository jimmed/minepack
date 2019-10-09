import { JsonFile, Path, PathLike } from '@minepack/fs'
import { normalize } from 'path'
import semver from 'semver'
import { ConfigValidationError } from './error'

export interface MinepackConfig {
  /**
   * Whether to enable the cache. If false, the cache directory will not ever be created.
   */
  enableCache?: boolean

  /**
   * The path to the cache directory. If relative, it will be resolved relative to the config directory.
   */
  cacheDirectory?: string

  /**
   * The path to the instance directory. If relative, it will be resolved relative to the config directory.
   */
  instanceDirectory?: string
}

export interface MinepackConfigMetadata {
  name: string
  version: string
  date: string | null
}

export type MinepackConfigWithMetadata = MinepackConfig & { lastUpdateBy: MinepackConfigMetadata }

export class ConfigFile extends JsonFile<MinepackConfigWithMetadata> {
  static from(pathOrFile: PathLike): ConfigFile {
    if (pathOrFile instanceof ConfigFile) {
      return pathOrFile
    }
    const { root, dir, base, ext, name } = Path.from(pathOrFile)
    return new ConfigFile(root, dir, base, ext, name)
  }

  static get version() {
    const { name, version } = require('../package.json')
    return { name, version }
  }

  static get defaults(): Required<MinepackConfigWithMetadata> {
    const { name, version } = this.version
    return {
      enableCache: true,
      cacheDirectory: 'cache',
      instanceDirectory: 'instance',
      lastUpdateBy: {
        name,
        version,
        date: null,
      },
    }
  }

  static validateConfig(config: Partial<MinepackConfigWithMetadata>): void {
    const { name, version } = this.version
    if (!config.lastUpdateBy) {
      console.warn(`Config file does not have any update metadata`)
    } else if (config.lastUpdateBy.name !== name) {
      console.warn(
        `Config file was last updated by something other than Minepack (${config.lastUpdateBy.name}@${config.lastUpdateBy.version})`,
      )
    } else if (config.lastUpdateBy.version !== version) {
      const fileVersion = config.lastUpdateBy.version
      const versionDiff = semver.diff(fileVersion, version)
      switch (versionDiff) {
        case 'major':
          throw new ConfigValidationError(
            config,
            `Config file was last updated by ${fileVersion}, which is incompatible with ${version}`,
          )
        case 'minor':
          console.warn(`Config file was last updated by ${fileVersion}, which might not be compatible with ${version}`)
      }
      console.warn(
        `Config file was last updated by a different version of Minepack (v${config.lastUpdateBy.version} > v${version})`,
      )
    }

    if (!['undefined', 'boolean'].includes(typeof config.enableCache)) {
      throw new ConfigValidationError(config, 'enableCache must be a boolean')
    }
    if (!['undefined', 'string'].includes(typeof config.cacheDirectory)) {
      throw new ConfigValidationError(config, 'cacheDirectory must be a string')
    }
    if (!['undefined', 'string'].includes(typeof config.instanceDirectory)) {
      throw new ConfigValidationError(config, 'instanceDirectory must be a string')
    }

    if (
      config.cacheDirectory &&
      config.instanceDirectory &&
      normalize(config.cacheDirectory) === normalize(config.instanceDirectory)
    ) {
      throw new ConfigValidationError(config, 'cacheDirectory and instanceDirectory must not resolve to the same path')
    }

    if (config.enableCache === false && typeof config.cacheDirectory !== 'undefined') {
      console.warn('enableCache is false, but cacheDirectory is set')
    }
  }

  static async create(path: PathLike, config: MinepackConfig): Promise<ConfigFile> {
    const file = ConfigFile.from(path)
    await file.ensureParentDirectoryExists()
    await file.updateConfig(config)
    return file
  }

  async readConfig(): Promise<MinepackConfigWithMetadata> {
    const defaults = ConfigFile.defaults

    if (!this.exists()) {
      return defaults
    }

    const fromFile = await this.readAsJson()
    ConfigFile.validateConfig(fromFile)

    return {
      ...defaults,
      ...fromFile,
    }
  }

  async updateConfig(patch: Partial<MinepackConfig>) {
    const { name, version } = ConfigFile.version
    const lastUpdateBy = {
      name,
      version,
      date: new Date().toISOString(),
    }
    const newConfig = { ...patch, lastUpdateBy }
    ConfigFile.validateConfig(newConfig)
    await this.patchJson(newConfig)
  }
}
