import { createReadStream, createWriteStream, promises as fs, ReadStream, WriteStream } from 'fs'
import { Path, PathLike } from './Path'

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
  static async createFromBuffer<T extends File>(this: typeof File, path: PathLike, buffer: Buffer): Promise<T> {
    const file = new this(path) as T
    await file.writeFromBuffer(buffer)
    return file
  }

  static createFromStream<T extends File, S extends NodeJS.ReadableStream>(
    path: PathLike,
    readStream: S,
    options?: ReadStreamOptions,
  ): FileWriteProgress<S> & { file: T } {
    const file = new this(path) as T
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

  async move<T extends Path>(this: T, destinationPath: PathLike): Promise<T> {
    const destination = new (this.constructor as typeof Path)(destinationPath) as T
    await fs.rename(this.path, destination.path)
    return destination
  }

  async copy<T extends Path>(this: T, destinationPath: PathLike): Promise<T> {
    const destination = new (this.constructor as typeof Path)(destinationPath) as T
    await fs.copyFile(this.path, destination.path)
    return destination
  }

  async delete(): Promise<void> {
    await fs.unlink(this.path)
  }
}
