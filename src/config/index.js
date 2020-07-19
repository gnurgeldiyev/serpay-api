import dotenv from 'dotenv'
import { join } from 'path'

const result = dotenv.config({ path: join(__dirname, '../../.env') })
if (result.error) {
  throw result.error
}

export const NODE_ENV = process.env.NODE_ENV
export const HOST = process.env.HOST
export const PORT = process.env.PORT
export const BASE_URL = process.env.BASE_URL
export const MONGODB_URI = process.env.MONGODB_URI
export const PASSWORD_SALT = process.env.PASSWORD_SALT
export const TOKEN_SALT =  process.env.TOKEN_SALT
