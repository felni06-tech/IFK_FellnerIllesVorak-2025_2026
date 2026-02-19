import express from 'express'
import { adminLogin, approveRegistration, getPendingRegistrations } from '../controllers/admin.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/login', adminLogin)

router.use(verifyToken)
router.use(verifyAdmin)

router.get('/pending', getPendingRegistrations)
router.patch('/approve/:id', approveRegistration)

export default router