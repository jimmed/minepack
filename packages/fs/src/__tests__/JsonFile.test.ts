import fs from 'jest-plugin-fs'
import { JsonFile } from '../JsonFile'

jest.mock('fs', () => require('jest-plugin-fs/mock'))

const mockFilePath = '/path.json'
const mockContent = { hello: 'thar!' }

describe('JsonFile', () => {
  beforeEach(() => fs.mock())
  afterEach(() => fs.restore())
  describe('#createFromJson', () => {
    it('should create the file on disk and return a JsonFile', async () => {
      const file = await JsonFile.createFromJson(mockFilePath, mockContent)
      expect(file).toBeInstanceOf(JsonFile)
      expect(fs.files()[mockFilePath]).toEqual(JSON.stringify(mockContent))
    })
  })

  describe('.readAsJson', () => {
    beforeEach(() => fs.mock({ [mockFilePath]: JSON.stringify(mockContent) }))
    it('should return the file content as a string', async () => {
      const file = new JsonFile(mockFilePath)
      await expect(file.readAsJson()).resolves.toEqual(mockContent)
    })
  })

  describe('.writeAsJson', () => {
    it('should write the file content to disk', async () => {
      const file = new JsonFile(mockFilePath)
      await expect(file.writeFromJson(mockContent)).resolves.toBeUndefined()
      expect(fs.files()[mockFilePath]).toEqual(JSON.stringify(mockContent))
    })
  })

  describe('.updateJson', () => {
    beforeEach(() => fs.mock({ [mockFilePath]: JSON.stringify(mockContent) }))
    it('should update the existing JSON on disk', async () => {
      const file = new JsonFile(mockFilePath)
      const updater = <T>(old: T) => ({ foo: 'bar', old })
      const expectedContent = { foo: 'bar', old: mockContent }
      await expect(file.updateJson(updater)).resolves.toEqual(expectedContent)
      expect(fs.files()[mockFilePath]).toEqual(JSON.stringify(expectedContent))
    })
  })

  describe('.patchJson', () => {
    beforeEach(() => fs.mock({ [mockFilePath]: JSON.stringify(mockContent) }))
    it('should update the existing JSON on disk', async () => {
      const file = new JsonFile(mockFilePath)
      const expectedContent = { hello: 'thar!', foo: 'bar' }
      await expect(file.patchJson({ foo: 'bar' })).resolves.toEqual(expectedContent)
      expect(fs.files()[mockFilePath]).toEqual(JSON.stringify(expectedContent))
    })
  })
})
