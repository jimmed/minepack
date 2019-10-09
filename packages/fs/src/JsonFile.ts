import { TextFile } from './TextFile'
import { PathLike, Path } from './Path'
import { ReadFileOptions, WriteFileOptions } from './File'

export interface JsonParseOptions {
  /**
   * A function that transforms the results. This function is called for each member of the object.
   */
  reviver?(this: any, key: string, value: any): any
}

export interface JsonStringifyOptions {
  /**
   * A function that transforms the results, OR an array of strings and numbers that acts as a approved list for selecting the object properties that will be stringified.
   */
  replacer?: (number | string)[] | ((this: any, key: string, value: any) => any)

  /**
   * Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read
   */
  space?: string | number
}

export type JsonFileUpdateOptions = ReadFileOptions & WriteFileOptions & JsonParseOptions & JsonStringifyOptions

export class JsonFile<T = unknown> extends TextFile {
  protected constructor(root: string, dir: string, base: string, ext: string, name: string) {
    super(root, dir, base, ext, name, 'utf8')
  }

  static fromPath<T>(pathOrFile: PathLike): JsonFile<T> {
    if (pathOrFile instanceof JsonFile) {
      return pathOrFile
    }
    const { root, dir, base, ext, name } = Path.from(pathOrFile)
    return new JsonFile(root, dir, base, ext, name)
  }

  static async createFromJson<T>(
    path: PathLike,
    value: T,
    options?: WriteFileOptions & JsonStringifyOptions,
  ): Promise<JsonFile<T>> {
    const file = JsonFile.fromPath<T>(path)
    await file.ensureParentDirectoryExists()
    await file.writeFromJson(value, options)
    return file
  }

  async readAsJson({ reviver, ...readOptions }: ReadFileOptions & JsonParseOptions = {}): Promise<T> {
    const text = await this.readAsText(readOptions)
    return JSON.parse(text, reviver) as T
  }

  async writeFromJson(
    value: T,
    { replacer, space, ...writeOptions }: WriteFileOptions & JsonStringifyOptions = {},
  ): Promise<void> {
    const json = JSON.stringify(value, replacer as (number | string)[], space)
    await this.writeFromText(json, writeOptions)
  }

  async updateJson(updater: (oldValue: T) => T | Promise<T>, options?: JsonFileUpdateOptions): Promise<T> {
    const oldValue = await this.readAsJson(options)
    const newValue = await updater(oldValue)
    await this.writeFromJson(newValue, options)
    return newValue
  }

  async patchJson(patch: Partial<T>, options?: JsonFileUpdateOptions): Promise<T> {
    return this.updateJson(oldValue => ({ ...oldValue, patch }), options)
  }
}
