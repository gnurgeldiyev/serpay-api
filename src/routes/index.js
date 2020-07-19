import editorRoutes from './editor'
import poetRoutes from './poet'
import poemRoutes from './poem'

// Import Routes
export default (app) => {
  app.use('/api/editors', editorRoutes)
  app.use('/api/poets', poetRoutes)
  app.use('/api/poems', poemRoutes)
}
