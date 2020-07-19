import app from './server'
import { HOST, PORT } from './config'

// TODO: require db connection

// run the server
app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`)
})
