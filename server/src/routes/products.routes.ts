import { Router } from 'express'
import * as productsController from '../controllers/products.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'

export const productsRouter = Router()

productsRouter.get('/', asyncHandler(productsController.listProducts))
productsRouter.post('/', requireAuth, requireRole('admin'), asyncHandler(productsController.createProduct))
productsRouter.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(productsController.updateProduct),
)
productsRouter.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(productsController.deleteProduct),
)
