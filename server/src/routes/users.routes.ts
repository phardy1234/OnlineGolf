import { Router } from 'express'
import * as usersController from '../controllers/users.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const usersRouter = Router()

usersRouter.patch('/me', requireAuth, asyncHandler(usersController.updateOwnProfile))

usersRouter.get('/:email', asyncHandler(usersController.getUserByEmail))
