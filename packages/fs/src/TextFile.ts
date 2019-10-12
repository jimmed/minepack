import { promises as fs } from 'fs'
import { File, ReadFileOptions, WriteFileOptions } from './File'
import { PathLike } from './Path'

export class TextFile extends File {
  constructor(parsed: PathLike, private readonly encoding: BufferEncoding = 'utf8') {
    super(parsed)
  }

  static async createFromText<T extends TextFile>(
    this: typeof TextFile,
    path: PathLike,
    text: string,
    encoding: BufferEncoding = 'utf8',
    writeOptions?: WriteFileOptions,
  ): Promise<T> {
    const file = new this(path, encoding) as T
    await file.writeFromText(text, writeOptions)
    return file
  }

  async readAsText(options?: ReadFileOptions): Promise<string> {
    return fs.readFile(this.path, { encoding: this.encoding, ...options })
  }

  async writeFromText(text: string, options?: WriteFileOptions): Promise<void> {
    return fs.writeFile(this.path, text, { encoding: this.encoding, ...options })
  }
}
