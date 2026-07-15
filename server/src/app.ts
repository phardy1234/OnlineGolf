import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { config } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.routes.js'
import { contactRouter } from './routes/contact.routes.js'
import { ordersRouter } from './routes/orders.routes.js'
import { productsRouter } from './routes/products.routes.js'
import { usersRouter } from './routes/users.routes.js'

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

app.use(errorHandler)
