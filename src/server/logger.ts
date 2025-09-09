import { cloudWatchLogger } from './cloudwatch'

// Initialize CloudWatch logging
cloudWatchLogger.initialize()

export const logger = {
  info: (message: string, metadata?: any) => cloudWatchLogger.info(message, metadata),
  error: (message: string, metadata?: any) => cloudWatchLogger.error(message, metadata),
  warn: (message: string, metadata?: any) => cloudWatchLogger.warn(message, metadata),
  debug: (message: string, metadata?: any) => cloudWatchLogger.debug(message, metadata),
}
