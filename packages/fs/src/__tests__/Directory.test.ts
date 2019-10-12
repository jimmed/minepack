import { Directory } from '../'
import fs from 'jest-plugin-fs'
import { Path } from '../Path'

jest.mock('fs', () => require('jest-plugin-fs/mock'))

const mockDirPath = '/path/to/directory'

describe('Directory', () => {
  beforeEach(() => fs.mock())
  beforeEach(() => fs.restore())

  describe('#create', () => {
    it('should create a directory on disk and return a Directory', async () => {
      const dir = await Directory.create(mockDirPath)
      expect(dir).toBeInstanceOf(Directory)
      expect(dir.path).toBe(mockDirPath)
      expect(fs.files()).toMatchObject({ [mockDirPath]: null })
    })
  })

  describe('#home', () => {
    it('should return a Directory', () => {
      expect(Directory.home()).toBeInstanceOf(Directory)
    })
  })

  describe('#tmp', () => {
    it('should return a Directory', () => {
      expect(Directory.tmp()).toBeInstanceOf(Directory)
    })
  })

  describe('.resolve', () => {
    it('should return the resolved path as a Path', () => {
      const resolved = new Directory(mockDirPath).resolve('..', 'somewhere', 'else')
      expect(resolved).toBeInstanceOf(Path)
      expect(resolved).toHaveProperty('path', '/path/to/somewhere/else')
    })
  })

  describe('.create', () => {
    it('should create the directory on disk', async () => {
      await new Directory(mockDirPath).create()
      expect(fs.files()).toMatchObject({ [mockDirPath]: null })
    })
  })

  describe('.delete', () => {
    beforeEach(() => fs.mock({ [mockDirPath]: { '.empty': '' } }))
    it('should delete the directory', async () => {
      // TODO: This is a bodge; jest-plugin-fs not playing nice with empty dir
      await jest.requireMock('fs').promises.unlink(`${mockDirPath}/.empty`)
      await expect(new Directory(mockDirPath).delete()).resolves.toBeUndefined()
      expect(fs.files()[mockDirPath]).toBeUndefined()
    })
  })
})
