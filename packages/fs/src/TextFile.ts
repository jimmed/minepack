import { File, ReadFileOptions, WriteFileOptions } from './File'
import { PathLike, Path } from './Path'
import { promises as fs } from 'fs'

export class TextFile extends File {
  protected constructor(
    root: string,
    dir: string,
    base: string,
    ext: string,
    name: string,
    readonly encoding: BufferEncoding,
  ) {
    super(root, dir, base, ext, name)
  }

  static from(path: PathLike, encoding: BufferEncoding = 'utf8'): TextFile {
    if (path instanceof TextFile) {
      return path
    }
    const { root, dir, base, ext, name } = Path.from(path)
    return new TextFile(root, dir, base, ext, name, encoding)
  }

  static async createFromText(
    path: PathLike,
    text: string,
    encoding: BufferEncoding = 'utf8',
    writeOptions: WriteFileOptions,
  ): Promise<TextFile> {
    const file = TextFile.from(path, encoding)
    await file.ensureParentDirectoryExists()
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
