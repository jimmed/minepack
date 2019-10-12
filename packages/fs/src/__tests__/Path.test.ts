import { parse } from 'path'
import { Path } from '../'
import fs from 'jest-plugin-fs'

jest.mock('fs', () => require('jest-plugin-fs/mock'))

describe('Path', () => {
  const mockPathString = '/path/to/resource.ext'
  const mockPathObject = parse(mockPathString)

  beforeEach(() => fs.mock())
  afterEach(() => fs.restore())

  describe.each([['a string', mockPathString], ['an object', mockPathObject]])(
    'when constructed with %s',
    (_, pathInput) => {
      let path: Path
      beforeEach(() => {
        path = new Path(pathInput)
      })

      it('should be a Path object', () => {
        expect(path).toBeInstanceOf(Path)
      })

      it.each(Object.entries(mockPathObject))('should have the correct %s property', (key, value) =>
        expect(path).toHaveProperty(key, value),
      )

      describe('.path', () => {
        it('should have the correct path property', () => {
          expect(path).toHaveProperty('path', mockPathString)
        })
      })

      describe('.toString', () => {
        it('should return the absolute path as a string', () => {
          expect(path.toString()).toBe(mockPathString)
        })
      })

      describe('.toJSON', () => {
        it('should return the absolute path as an object', () => {
          expect(path.toJSON()).toEqual(mockPathObject)
        })
      })

      describe('.resolve', () => {
        it('should return the resolved path as a Path', () => {
          const resolved = path.resolve('..', 'somewhere', 'else')
          expect(resolved).toBeInstanceOf(Path)
          expect(resolved).toHaveProperty('path', '/path/somewhere/else')
        })
      })

      describe('.exists', () => {
        describe('when the path does not exist', () => {
          describe('with the quiet option true (default)', () => {
            it('should resolve to be false', async () => {
              await expect(path.exists()).resolves.toBe(false)
            })
          })

          describe('with the quiet option false', () => {
            it('should reject with the original filesystem error', async () => {
              await expect(path.exists({ quiet: false })).rejects.toThrowError(/^ENOENT:/)
            })
          })
        })

        describe('when the path exists as a file', () => {
          beforeEach(() => {
            fs.mock({ [mockPathString]: 'hello thar' })
          })
          it('should resolve to be true', async () => {
            await expect(path.exists()).resolves.toBe(true)
          })
        })

        describe('when the path exists as a directory', () => {
          beforeEach(() => {
            fs.mock({ [mockPathString]: { 'file.ext': 'hello thar' } })
          })
          it('should resolve to be true', async () => {
            await expect(path.exists()).resolves.toBe(true)
          })
        })
      })
    },
  )
})
