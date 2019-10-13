declare module 'jest-plugin-fs' {
  export type Files = Record<string, string | IFiles>
  interface IFiles extends Files {}

  export namespace fs {
    function mock(files?: Files): void
    function restore(): void
    function files(): Files
  }
  export default fs
}

declare module 'jest-plugin-fs/mock' {
  import fs from 'fs'
  export default fs
}
