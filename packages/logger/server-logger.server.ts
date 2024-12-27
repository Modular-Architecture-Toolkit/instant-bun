import { createLoggerFactory, type LogLevel } from './create-logger-factory'

export async function logToDB(level: LogLevel, message: string, code: string | undefined) {
  try {
    //   log to db here
  } catch (error) {
    console.error('Logging Error:', error)
  }
}

// Server-side logger
export const serverLogger = createLoggerFactory(logToDB)
