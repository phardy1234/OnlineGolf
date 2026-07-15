import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

export const authRouter = Router()

authRouter.post('/signup', asyncHandler(authController.signup))
authRouter.post('/login', asyncHandler(authController.login))
authRouter.post('/logout', asyncHandler(authController.logout))
authRouter.get('/me', asyncHandler(authController.me))
