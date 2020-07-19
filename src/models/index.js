import mongoose from 'mongoose'
import Logger from '../helpers/logger'
import editorSchema from './editor'
import poemSchema from './poem'
import poetSchema from './poet'
import { MONGODB_URI } from '../config'

// Setup MongoDB with mongoose
const options = {
  retryWrites: true,
  useNewUrlParser: true,
  autoIndex: false,
  useFindAndModify: false,
  useCreateIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  useUnifiedTopology: true
}
// connect to db
const conn = mongoose.createConnection(MONGODB_URI, options)
conn.on('error', (err) => {
  Logger.error(err)
  process.exit(1)
})
conn.on('connected', () => {
  Logger.info({ message: 'App DB connection is successfull' })
})

// create db collections
conn.model('Editor', editorSchema, 'editors')
conn.model('Poem', poemSchema, 'poems')
conn.model('Poet', poetSchema, 'poets')

export default conn
