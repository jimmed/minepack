import fs from 'jest-plugin-fs'
import { File } from '../'
import { Readable } from 'stream'
import { createReadStream } from 'fs'

jest.mock('fs', () => require('jest-plugin-fs/mock'))

describe('File', () => {
  beforeEach(() => fs.mock())
  afterEach(() => fs.restore())

  const mockFilePath = '/file.ext'
  const mockFileContent = 'hello thar'

  describe('#createFromBuffer', () => {
    it('should write the Buffer to disk at the specified path', async () => {
      await expect(File.createFromBuffer(mockFilePath, Buffer.from(mockFileContent))).resolves.toBeInstanceOf(File)
      expect(fs.files()[mockFilePath]).toEqual(mockFileContent)
    })
  })

  describe('#createFromStream', () => {
    beforeEach(() => fs.mock({ '/other.file': mockFileContent }))
    it('should write the stream contents to disk at the specified path', async () => {
      const { file, done } = File.createFromStream(mockFilePath, createReadStream('/other.file'))
      expect(file).toBeInstanceOf(File)
      expect(file.path).toBe(mockFilePath)
      await expect(done).resolves.toBeUndefined()
      expect(fs.files()[mockFilePath]).toEqual(mockFileContent)
    })
  })

  describe('.readAsBuffer', () => {
    beforeEach(() => fs.mock({ [mockFilePath]: mockFileContent }))
    it('should read the contents of the file as a Buffer', async () => {
      await expect(new File(mockFilePath).readAsBuffer()).resolves.toMatchObject(Buffer.from(mockFileContent))
    })
  })

  describe('.writeFromBuffer', () => {
    it('should write the contents of the file from the Buffer', async () => {
      await expect(new File(mockFilePath).writeFromBuffer(Buffer.from(mockFileContent))).resolves.toBeUndefined()
      expect(fs.files()[mockFilePath]).toBe(mockFileContent)
    })
  })

  describe('.move', () => {
    beforeEach(() => fs.mock({ [mockFilePath]: mockFileContent }))
    it('should move the file to the new location', async () => {
      const oldFile = new File(mockFilePath)
      const newFile = await oldFile.move('/other.file')
      expect(fs.files()[mockFilePath]).not.toBeDefined()
      expect(fs.files()['/other.file']).toBe(mockFileContent)
      expect(oldFile.path).toBe(mockFilePath)
      expect(newFile.path).toBe('/other.file')
    })
  })

  describe('.move', () => {
    beforeEach(() => fs.mock({ [mockFilePath]: mockFileContent }))
    it('should copy the file to the new location', async () => {
      const oldFile = new File(mockFilePath)
      const newFile = await oldFile.copy('/other.file')
      expect(fs.files()[mockFilePath]).toBe(mockFileContent)
      expect(fs.files()['/other.file']).toBe(mockFileContent)
      expect(oldFile.path).toBe(mockFilePath)
      expect(newFile.path).toBe('/other.file')
    })
  })

  describe('.readStream / .writeStream', () => {
    beforeEach(() => fs.mock({ [mockFilePath]: mockFileContent }))
    it('should allow piping from one file to another', async () => {
      const oldFile = new File(mockFilePath)
      const newFile = new File('/other.file')
      await expect(
        new Promise((resolve, reject) => {
          oldFile
            .readStream()
            .pipe(newFile.writeStream())
            .on('error', reject)
            .on('close', resolve)
        }),
      ).resolves.toBeUndefined()
      expect(fs.files()[mockFilePath]).toBe(mockFileContent)
      expect(fs.files()['/other.file']).toBe(mockFileContent)
      expect(oldFile.path).toBe(mockFilePath)
      expect(newFile.path).toBe('/other.file')
    })
  })

  describe('.delete', () => {
    beforeEach(() => fs.mock({ [mockFilePath]: mockFileContent }))
    it('should delete the file', async () => {
      await expect(new File(mockFilePath).delete()).resolves.toBeUndefined()
      expect(fs.files()[mockFilePath]).toBeUndefined()
    })
  })
})
