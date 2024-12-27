export type LogLevel = 'info' | 'warn' | 'error'

const logLevels: Record<'INFO' | 'WARN' | 'ERROR', LogLevel> = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
}

export type ErrorCodes = keyof typeof errorCodeMap

export const errorCodeMap = {
  API_ERROR: 'API_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FORBIDDEN_ERROR: 'FORBIDDEN_ERROR',
  STOPPING_SERVER_ERROR: 'STOPPING_SERVER_ERROR',
}

export type LoggerFunction = (level: LogLevel, message: string, data: any, code?: ErrorCodes | undefined) => void

export function createLoggerFactory(loggerFunction: LoggerFunction) {
  const processLog = (level: LogLevel) => (message: string, data: any, code?: ErrorCodes) => {
    const loggableData = data ? JSON.stringify(data) : ''

    const logPayload: string[] = []

    logPayload.push(`[${level.toUpperCase()}] DT: ${new Date().toISOString()}`)
    logPayload.push(`MESSAGE: ${message}`)

    if (loggableData) {
      logPayload.push(`DATA: ${loggableData}`)
    }

    if (code) {
      logPayload.push(`CODE: ${code}`)
    }

    // Use the passed loggerFunction to handle logging
    loggerFunction(level, message, code, data)
  }

  return {
    info: processLog(logLevels.INFO),
    warn: processLog(logLevels.WARN),
    error: processLog(logLevels.ERROR),
  }
}

// Usage:
