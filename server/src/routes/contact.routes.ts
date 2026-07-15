import { Router } from 'express'
import * as contactController from '../controllers/contact.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

export const contactRouter = Router()

contactRouter.post('/', asyncHandler(contactController.createContactMessage))
