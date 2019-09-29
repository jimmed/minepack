import {
  getVersionListing,
  GetVersionListingOptions,
  RawVersion,
  VersionType,
} from './remote/getVersionListing'
import {
  VersionManifest,
  getVersionManifest,
} from './remote/getVersionManifest'

export class MinecraftVersion {
  constructor(
    protected rawDefinition: RawVersion,
    protected options: Partial<GetVersionListingOptions> = {},
  ) {}

  get id(): string {
    return this.rawDefinition.id
  }

  get type(): VersionType {
    return this.rawDefinition.type
  }

  get manifestUrl(): string {
    return this.rawDefinition.url
  }

  get releasedAt(): Date {
    return new Date(this.rawDefinition.releaseTime)
  }

  get availableSince(): Date {
    return new Date(this.rawDefinition.time)
  }

  async getVersionManifest(): Promise<VersionManifest> {
    return getVersionManifest(this.manifestUrl, this.options)
  }

  static from(
    definition: RawVersion,
    options?: Partial<GetVersionListingOptions>,
  ): MinecraftVersion {
    return new MinecraftVersion(definition, options)
  }

  static async getAll(
    options?: Partial<GetVersionListingOptions>,
  ): Promise<MinecraftVersion[]> {
    const { versions } = await getVersionListing(options)
    return versions.map(version => MinecraftVersion.from(version, options))
  }

  static async getAllIds(
    options?: Partial<GetVersionListingOptions>,
  ): Promise<string[]> {
    const { versions } = await getVersionListing(options)
    return versions.map(({ id }) => id)
  }

  static async find(
    finder: (version: RawVersion, index: number, list: RawVersion[]) => boolean,
    options?: Partial<GetVersionListingOptions>,
  ): Promise<MinecraftVersion | null> {
    const { versions } = await getVersionListing(options)
    const version = versions.find(finder)
    return version ? this.from(version, options) : null
  }

  static async getById(
    id: string,
    options?: Partial<GetVersionListingOptions>,
  ): Promise<MinecraftVersion | null> {
    return this.find(version => version.id === id)
  }

  static async getLatest(
    type: VersionType = VersionType.release,
    options?: Partial<GetVersionListingOptions>,
  ): Promise<MinecraftVersion | null> {
    const { latest } = await getVersionListing(options)
    if (type === VersionType.release || type === VersionType.snapshot) {
      return this.getById(latest[type], options)
    }
    return this.find(version => version.type === type)
  }
}
