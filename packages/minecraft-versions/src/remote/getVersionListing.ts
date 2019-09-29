import defaultFetch from 'node-fetch'

/**
 * `version_manifest.json` is the file containing a list of Java Edition versions from launchermeta.mojang.com.
 * It lists available Minecraft versions for the launcher.
 *
 * If a version is absent from this list, it is considered unavailable on the launcher, such as 1.14.3 Combat Test.
 *
 * This list is updated each time Mojang publishes a new version for Minecraft: Java Edition.
 *
 * @see https://minecraft.gamepedia.com/Version_manifest.json
 */
export interface VersionListing {
  /** The latest release and snapshot versions */
  latest: Record<VersionType.release | VersionType.snapshot, RawVersion['id']>
  /** A list of versions available */
  versions: RawVersion[]
}

export enum VersionType {
  snapshot = 'snapshot',
  release = 'release',
  oldAlpha = 'old_alpha',
  oldBeta = 'old_beta',
}

/**
 * One of the version entries from `version_manifest.json`
 */
export interface RawVersion {
  /** The ID of this version */
  id: string
  /** The type of this version; usually release or snapshot */
  type: VersionType
  /** The link to the <version id>.json for this version */
  url: string
  /** A timestamp in ISO 8601 format of when the version files were last updated on the manifest */
  time: string
  /** The release time of this version in ISO 8601 format */
  releaseTime: string
}

/**
 * The remote URL for `version_manifest.json`
 */
export const versionListingUrl =
  'https://launchermeta.mojang.com/mc/game/version_manifest.json'

export interface GetVersionListingOptions {
  fetch?: typeof defaultFetch
}

/**
 * Fetches the list of all available Minecraft versions
 */
export async function getVersionListing({
  fetch = defaultFetch,
}: GetVersionListingOptions = {}): Promise<VersionListing> {
  const response = await fetch(versionListingUrl)
  return response.json()
}
