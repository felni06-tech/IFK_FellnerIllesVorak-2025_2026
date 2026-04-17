import express from 'express'
import { getAvailableAppointments, generateAppointments } from '../controllers/appointment.controller.js'
import { verifyToken, isProvider } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(verifyToken)

//Időpontok lekérése: GET /api/appointments/available
router.get('/available', getAvailableAppointments)

//Időpontok generálása: POST /api/appointments/generate
router.post('/generate', isProvider, generateAppointments)

export default router