import express from 'express'
import { generateAppointments } from '../controllers/appointment.controller.js'
import { verifyToken, isProvider } from '../middlewares/auth.middleware.js'

const router = express.Router()

//Időpontok generálása: POST /api/appointments/generate
router.post('/generate', verifyToken, isProvider, generateAppointments)

export default router