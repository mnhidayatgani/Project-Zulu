import pino from 'pino'

/**
 * Centralized logging utility
 * Replaces console.log statements throughout the application
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
})

/**
 * Create a child logger for specific modules
 * @param module - The module name (e.g., 'auth', 'api', 'chat')
 */
export const createLogger = (module: string) => {
  return logger.child({ module })
}

// Export common logging functions
export const log = {
  info: logger.info.bind(logger),
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  debug: logger.debug.bind(logger),
  trace: logger.trace.bind(logger),
}
