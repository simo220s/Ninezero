/// <reference types="vite/client" />

import type { logger as loggerType } from './lib/logger'

declare global {
  const logger: typeof loggerType
}