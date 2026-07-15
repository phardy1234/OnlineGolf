import { app } from './app.js'
import { connectToDatabase } from './config/db.js'
import { config } from './config/env.js'

async function start() {
  await connectToDatabase()
  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
