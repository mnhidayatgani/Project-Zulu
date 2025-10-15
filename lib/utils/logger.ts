import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})

// Helper functions
export const log = {
  info: (msg: string, ...args: unknown[]) => logger.info(msg, ...args),
  error: (msg: string, ...args: unknown[]) => logger.error(msg, ...args),
  warn: (msg: string, ...args: unknown[]) => logger.warn(msg, ...args),
  debug: (msg: string, ...args: unknown[]) => logger.debug(msg, ...args),
}
