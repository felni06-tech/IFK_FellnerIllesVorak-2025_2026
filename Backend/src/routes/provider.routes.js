import express from 'express'
import { updateMyProfile, getMyProfile, getMyBookings } from '../controllers/provider.controller.js'
import { verifyToken, isProvider } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(verifyToken)
router.use(isProvider)

router.get('/bookings', getMyBookings)

router.get('/me', getMyProfile)

router.post('/update', updateMyProfile)

export default router