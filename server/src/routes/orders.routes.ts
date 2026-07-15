import { Router } from 'express'
import * as ordersController from '../controllers/orders.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const ordersRouter = Router()

ordersRouter.post('/', requireAuth, asyncHandler(ordersController.placeOrder))
ordersRouter.get('/', requireAuth, asyncHandler(ordersController.listOrdersForUser))
