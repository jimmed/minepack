import fs from 'jest-plugin-fs'
import { TextFile } from '../TextFile'

jest.mock('fs', () => require('jest-plugin-fs/mock'))

const mockFilePath = '/path.txt'
const mockContent = 'hello thar!'

describe('TextFile', () => {
  beforeEach(() => fs.mock())
  afterEach(() => fs.restore())
  describe('#createFromText', () => {
    it('should create the file on disk and return a TextFile', async () => {
      const file = await TextFile.createFromText(mockFilePath, mockContent)
      expect(file).toBeInstanceOf(TextFile)
      expect(fs.files()[mockFilePath]).toBe(mockContent)
    })
  })

  describe('.readAsText', () => {
    beforeEach(() => fs.mock({ [mockFilePath]: mockContent }))
    it('should return the file content as a string', async () => {
      const file = new TextFile(mockFilePath)
      await expect(file.readAsText()).resolves.toBe(mockContent)
    })
  })

  describe('.writeAsText', () => {
    it('should write the file content to disk', async () => {
      const file = new TextFile(mockFilePath)
      await expect(file.writeFromText(mockContent)).resolves.toBeUndefined()
      expect(fs.files()[mockFilePath]).toBe(mockContent)
    })
  })
})
