import { createLoggerFactory } from './create-logger-factory'

export const defaultLogger = createLoggerFactory((level, message, code, data) => {
  if (level === 'error') {
    console.error({
      level,
      message,
      code,
      data,
    })
  }
  if (level === 'warn') {
    console.warn({
      level,
      message,
      code,
      data,
    })
  }

  if (level === 'info') {
    console.info({
      level,
      message,
      code,
      data,
    })
  }
})
