import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { config, isProduction } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.routes.js'
import { contactRouter } from './routes/contact.routes.js'
import { ordersRouter } from './routes/orders.routes.js'
import { productsRouter } from './routes/products.routes.js'
import { usersRouter } from './routes/users.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// server/dist/app.js -> repo root's dist/ (the built Vite frontend)
const clientDistPath = path.resolve(__dirname, '../../dist')

export const app = express()

app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/contact', contactRouter)

if (isProduction) {
  app.use(express.static(clientDistPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
}

app.use(errorHandler)
