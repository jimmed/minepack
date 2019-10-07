import { JsonFile } from '@minepack/fs'
import semver from 'semver'

export interface MinepackConfig {
  /**
   * Whether to enable the cache. If false, the cache directory will not ever be created.
   */
  enableCache?: boolean

  /**
   * The path to the cache directory. If relative, it will be resolved relative to the config directory.
   */
  cacheDirectory?: string
}

export interface MinepackConfigMetadata {
  name: string
  version: string
  date: string | null
}

export type MinepackConfigWithMetadata = MinepackConfig & { lastUpdateBy: MinepackConfigMetadata }

export class ConfigFile extends JsonFile<MinepackConfigWithMetadata> {
  static get version() {
    const { name, version } = require('../package.json')
    return { name, version }
  }

  static get defaults(): Required<MinepackConfigWithMetadata> {
    const { name, version } = this.version
    return {
      enableCache: true,
      cacheDirectory: 'cache',
      lastUpdateBy: {
        name,
        version,
        date: null,
      },
    }
  }

  async read(): Promise<MinepackConfigWithMetadata> {
    const pkgJson = ConfigFile.version
    const defaults = ConfigFile.defaults

    if (!this.exists()) {
      return defaults
    }

    const fromFile = await this.readAsJson()
    if (!fromFile.lastUpdateBy) {
      console.warn(`Config file at ${this.path} does not have any update metadata.`)
    } else if (fromFile.lastUpdateBy.name !== pkgJson.name) {
      console.warn(`Config file at ${this.path} was last updated by something other than Minepack`)
    } else if (semver.gt(fromFile.lastUpdateBy.version, pkgJson.version)) {
      console.warn(
        `Config file at ${this.path} was last updated by a newer version of Minepack (${fromFile.lastUpdateBy.version} > ${pkgJson.version})`,
      )
    }

    return {
      ...defaults,
      ...fromFile,
    }
  }

  async update(patch: Partial<MinepackConfig>) {
    const { name, version } = ConfigFile.version
    const lastUpdateBy = {
      name,
      version,
      date: new Date().toISOString(),
    }
    await this.patchJson({ ...patch, lastUpdateBy })
  }
}
