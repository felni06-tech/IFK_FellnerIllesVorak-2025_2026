import express from 'express'
import { updateMyProfile, getMyProfile } from '../controllers/provider.controller.js'
import { verifyToken, isProvider } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/me', verifyToken, isProvider, getMyProfile)

router.post('/update', verifyToken, isProvider, updateMyProfile)

export default router