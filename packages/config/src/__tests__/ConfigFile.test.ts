import { ConfigFile } from '../ConfigFile'
import semver from 'semver'

describe('ConfigFile', () => {
  describe('#validateConfig', () => {
    const lastUpdateBy = {
      date: null,
      name: require('../../package.json').name,
      version: require('../../package.json').version,
    }
    let consoleWarn: typeof console.warn
    beforeEach(() => {
      consoleWarn = console.warn
      console.warn = jest.fn()
    })
    afterEach(() => {
      console.warn = consoleWarn
    })

    it('should not throw for a valid config', () => {
      expect(() =>
        ConfigFile.validateConfig({
          enableCache: true,
          cacheDirectory: 'my-cache',
          instanceDirectory: 'my-instance',
          lastUpdateBy,
        }),
      ).not.toThrowError()
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should throw if enableCache is not a boolean', () => {
      expect(() =>
        ConfigFile.validateConfig({
          // @ts-ignore
          enableCache: 'yes',
          lastUpdateBy,
        }),
      ).toThrowError('enableCache must be a boolean')
      expect(console.warn).not.toHaveBeenCalled()
    })
    it('should throw if cacheDirectory is not a string', () => {
      expect(() =>
        ConfigFile.validateConfig({
          // @ts-ignore
          cacheDirectory: 3,
          lastUpdateBy,
        }),
      ).toThrowError('cacheDirectory must be a string')
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should throw if instanceDirectory is not a string', () => {
      expect(() =>
        ConfigFile.validateConfig({
          // @ts-ignore
          instanceDirectory: 3,
          lastUpdateBy,
        }),
      ).toThrowError('instanceDirectory must be a string')
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should throw if cacheDirectory and instanceDirectory are the same', () => {
      expect(() =>
        ConfigFile.validateConfig({
          cacheDirectory: 'same',
          instanceDirectory: './up/two/../../same',
          lastUpdateBy,
        }),
      ).toThrowError('cacheDirectory and instanceDirectory must not resolve to the same path')
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should throw if config was created by a different major version of minepack', () => {
      expect(() =>
        ConfigFile.validateConfig({
          lastUpdateBy: {
            ...lastUpdateBy,
            version: '4.2.0',
          },
        }),
      ).toThrowError('Config file was last updated by 4.2.0, which is incompatible with 0.1.0')
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should warn if config was created by a different module', () => {
      expect(() =>
        ConfigFile.validateConfig({
          lastUpdateBy: {
            name: 'another-package',
            version: '4.2.0',
            date: null,
          },
        }),
      ).not.toThrowError()
      expect(console.warn).toHaveBeenCalledWith(
        'Config file was last updated by something other than Minepack (another-package@4.2.0)',
      )
    })

    it('should warn if config was created by a different minor version of minepack', () => {
      expect(() =>
        ConfigFile.validateConfig({
          lastUpdateBy: {
            ...lastUpdateBy,
            version: semver.inc(require('../../package.json').version, 'minor')!,
          },
        }),
      ).not.toThrowError()
      expect(console.warn).toHaveBeenCalledWith(
        'Config file was last updated by a different version of Minepack (v0.2.0 > v0.1.0)',
      )
    })

    it('should warn if cache is disabled but cache directory is specified', () => {
      expect(() =>
        ConfigFile.validateConfig({
          enableCache: false,
          cacheDirectory: 'cache',
          lastUpdateBy,
        }),
      ).not.toThrowError()
      expect(console.warn).toHaveBeenCalledWith('enableCache is false, but cacheDirectory is set')
    })

    it('should warn if no config metadata is present', () => {
      expect(() =>
        ConfigFile.validateConfig({
          enableCache: true,
        }),
      ).not.toThrowError()
      expect(console.warn).toHaveBeenCalledWith('Config file does not have any update metadata')
    })
  })
})
