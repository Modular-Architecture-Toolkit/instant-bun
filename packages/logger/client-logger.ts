import { createLoggerFactory } from './create-logger-factory'

// Client-side logger
export const clientLogger = createLoggerFactory((level, message, code, data) => {
  // You can replace this with your own API request function
  try {
    // Here, you can replace `sendErrorToServer` with the actual function that sends the error to the server
    const sendErrorToServer = async (level: string, message: string, code: string | undefined, data: any) => {
      // TODO Implementation for sending the error to the server
    }
    sendErrorToServer(level, message, code, JSON.stringify(data))
  } catch (error) {
    console.error('Error sending log to server:', error)
  }
})
