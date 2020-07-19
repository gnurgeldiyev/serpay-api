import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'

import routes from '../routes'

const app = express()

// CORS config
app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// security headers
app.use(helmet())

// request body parser
app.use(bodyParser.json())

// compress with gzip
app.use(compression())

// attach routes
routes(app)

export default app
