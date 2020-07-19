import winston from 'winston'
import { join } from 'path'
import { NODE_ENV } from './index'

const appRoot = join(__dirname, './../../')

const options = {
  file: {
    level: 'warn',
    filename: `${appRoot}/logs/app.log`,
    exceptionHandlers: [
      new winston.transports.File({
        filename: `${appRoot}/logs/exceptions.log`
      })
    ],
    format: winston.format.json(),
    maxsize: 5242880, // 5MB
    maxFiles: 100
  },
  console: {
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }
}

const winstonLogger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false // do not exit on handled exceptions
})

winstonLogger.stream = {
  write(message) {
    winstonLogger.warn(message)
  }
}

export default winstonLogger
