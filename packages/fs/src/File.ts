import { Path, PathLike } from './Path'
import {
  ReadStream,
  createReadStream,
  WriteStream,
  createWriteStream,
  promises as fs,
  write,
  promises,
  Stats,
} from 'fs'
import { Directory } from './Directory'

export interface ReadStreamOptions {
  flags?: string
  encoding?: string
  fd?: number
  mode?: number
  autoClose?: boolean
  start?: number
  end?: number
  highWaterMark?: number
}

export interface WriteStreamOptions {
  flags?: string
  encoding?: string
  fd?: number
  mode?: number
  autoClose?: boolean
  start?: number
  highWaterMark?: number
}

export interface WriteFileOptions {
  mode?: string | number
  flag?: string | number
}

export interface ReadFileOptions {
  flag?: string | number
}

export interface FileWriteProgress<S extends NodeJS.ReadableStream> {
  readStream: S
  writeStream: WriteStream
  done: Promise<void>
}

export class File extends Path {
  protected constructor(root: string, dir: string, base: string, ext: string, name: string) {
    super(root, dir, base, ext, name)
  }

  get directory(): Directory {
    return Directory.from(this.dir)
  }

  static from(path: PathLike): File {
    if (path instanceof File) {
      return path
    }
    const { root, dir, base, ext, name } = Path.from(path)
    return new File(root, dir, base, ext, name)
  }

  async ensureParentDirectoryExists(): Promise<void> {
    await this.directory.create()
  }

  static async createFromBuffer(path: PathLike, buffer: Buffer): Promise<File> {
    const file = File.from(path)
    await file.ensureParentDirectoryExists()
    await file.writeFromBuffer(buffer)
    return file
  }

  static createFromStream<S extends NodeJS.ReadableStream>(
    path: PathLike,
    readStream: S,
    options?: ReadStreamOptions,
  ): FileWriteProgress<S> & { file: File } {
    const file = File.from(path)
    const writeProgress = file.writeFromStream(readStream, options)
    return {
      ...writeProgress,
      file,
    }
  }

  readStream(options?: ReadStreamOptions): ReadStream {
    return createReadStream(this.path, options)
  }

  writeStream(options?: WriteStreamOptions): WriteStream {
    return createWriteStream(this.path, options)
  }

  async readAsBuffer(options?: ReadFileOptions): Promise<Buffer> {
    return fs.readFile(this.path, options)
  }

  async writeFromBuffer(buffer: Buffer, options?: WriteFileOptions): Promise<void> {
    return fs.writeFile(this.path, buffer, options)
  }

  writeFromStream<S extends NodeJS.ReadableStream>(
    readStream: S,
    writeStreamOptions?: WriteStreamOptions,
  ): FileWriteProgress<S> {
    const writeStream = readStream.pipe(this.writeStream(writeStreamOptions))
    return {
      readStream,
      writeStream,
      get done(): Promise<void> {
        return new Promise((resolve, reject) => writeStream.on('close', resolve).on('error', reject))
      },
    }
  }

  async getStat(): Promise<Stats> {
    return fs.lstat(this.path)
  }
}
