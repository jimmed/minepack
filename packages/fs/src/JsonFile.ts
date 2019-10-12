import { TextFile } from './TextFile'
import { PathLike, Path } from './Path'
import { ReadFileOptions, WriteFileOptions } from './File'
import { ParsedPath } from 'path'

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

export class JsonFile<T> extends TextFile {
  constructor(parsed: PathLike) {
    super(parsed, 'utf8')
  }

  static async createFromJson<T, I extends JsonFile<T>, C extends typeof JsonFile>(
    this: C,
    path: PathLike,
    value: T,
    options?: WriteFileOptions & JsonStringifyOptions,
  ): Promise<I> {
    const file = new this<T>(path) as I
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
    return this.updateJson(oldValue => ({ ...oldValue, ...patch }), options)
  }
}
