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
  info: (msg: string, data?: unknown) => logger.info(data, msg),
  error: (msg: string, data?: unknown) => logger.error(data, msg),
  warn: (msg: string, data?: unknown) => logger.warn(data, msg),
  debug: (msg: string, data?: unknown) => logger.debug(data, msg),
}
