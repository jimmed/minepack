import { MinepackConfigWithMetadata } from '../ConfigFile'

export class ConfigValidationError extends Error {
  constructor(readonly config: Partial<MinepackConfigWithMetadata>, readonly error?: string | Error) {
    super(error instanceof Error ? error.message : error)
  }
}
