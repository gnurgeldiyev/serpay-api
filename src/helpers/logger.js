import dayjs from 'dayjs'
import winston from '../config/winston'

class Logger {
  static async info(data = {}) {
    winston.info(this.generateMessage(data))
  }

  static async warn(data = {}) {
    winston.warn(this.generateMessage(data))
  }

  static async error(data = {}) {
    winston.error(this.generateMessage(data))
  }

  static generateMessage(data) {
    const { name, code, message, path, dest, stack } = data
    const datetime = dayjs().format('HH:mm:ss DD/MMM')
    let text = ''
    if (name || code) {
      text += `${name || code}: `
    }
    if (message) {
      text += message
    }
    if (path || dest) {
      text += `> ${path || dest}`
    }
    if (stack) {
      text += `\n${stack}`
    }
    if (!text) {
      text = JSON.stringify(data)
      text = `${datetime}\n${text}`
    } else {
      text = `${datetime} - ${text}`
    }
    return text
  }
}

export default Logger
