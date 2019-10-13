import { JsonFile } from '@minepack/fs'

export interface InstallAssetManifest {
  path: string
  url: string
  ssri: string
}

export interface InstallManifest {
  // TODO: Integrate with @minepack/config
  lastUpdateBy: { name: string; version: string; date: string }
  assets: InstallAssetManifest[]
}

export class InstallManifestFile extends JsonFile<InstallManifest> {
  async updateJson(
    updater: (old: InstallManifest) => InstallManifest | Promise<InstallManifest>,
  ): Promise<InstallManifest> {
    return super.updateJson(async old => {
      const { assets } = await updater(old)
      return {
        lastUpdateBy: {
          name: '@minepack/installer',
          version: '0.1.0',
          date: new Date().toISOString(),
        },
        assets,
      }
    })
  }

  async addAssets(...assets: InstallAssetManifest[]): Promise<InstallManifest> {
    return this.updateJson(old => ({ ...old, assets: [...old.assets, ...assets] }))
  }
}
