import { VersionType, GetVersionListingOptions } from './getVersionListing'
import defaultFetch from 'node-fetch'

/**
 * @see https://minecraft.gamepedia.com/Client.json
 */
export interface VersionManifest {
  arguments: ClientArgumentsMap
  assetIndex: VersionAssetLink
  assets: string
  downloads: DownloadMap
  id: string
  libraries: Library[]
  logging: LoggingConfigMap
  mainClass: string
  minimumLauncherVersion: number
  releaseTime: string
  time: string
  type: VersionType
}

/**
 * 'game': Contains arguments supplied to the game, such as information about the username and the version.
 *
 * 'jvm': Contains JVM arguments, such as information about memory allocation, garbage collector selection, or environmental variables.
 */
export type ClientArgumentsMap = Record<'jvm' | 'game', ClientArgument[]>
export type ClientArgument = ClientArgumentObject | string
export interface ClientArgumentObject {
  rules: ClientArgumentRule[]
  value: string | string[]
}

export enum RuleAction {
  allow = 'allow',
  deny = 'deny',
}

export interface ClientArgumentRule {
  action: RuleAction
  features?: Record<string, boolean>
  os?: { name: string; version?: string } | { arch: string }
}

export interface VersionAssetLink {
  id: string
  sha1: string
  size: number
  totalSize: number
  url: string
}

export enum DownloadType {
  client = 'client',
  clientMappings = 'client_mappings',
  server = 'server',
  serverMappings = 'server_mappings',
}

export interface DownloadLink {
  sha1: string
  size: number
  url: string
}

export type DownloadMap = Record<DownloadType, DownloadLink>
export enum DownloadClassifier {
  javadoc = 'javadoc',
  linuxNatives = 'natives-linux',
  macOsNatives = 'natives-macosx',
  windowsNatives = 'natives-windows',
  sources = 'sources',
}

export enum OS {
  windows = 'windows',
  macOs = 'osx',
  linux = 'linux',
}

type DownloadLinkWithPath = DownloadLink & { path: string }

export interface Library {
  name: string
  downloads: { artifact: DownloadLinkWithPath } & Partial<
    Record<DownloadClassifier, DownloadLinkWithPath>
  >
  natives?: Partial<Record<OS, DownloadClassifier>>
  rules?: ClientArgumentRule[]
}

export interface LoggingConfigMap {
  client: {
    argument: string
    file: {
      id: string
      sha1: string
      size: number
      url: string
    }
    type: string
  }
}

export async function getVersionManifest(
  url: string,
  { fetch = defaultFetch }: Partial<GetVersionListingOptions> = {},
): Promise<VersionManifest> {
  const response = await fetch(url)
  return response.json()
}
