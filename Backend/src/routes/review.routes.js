import express from 'express'
import { addReview } from '../controllers/review.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(verifyToken)

router.post('/add', addReview)

export default router