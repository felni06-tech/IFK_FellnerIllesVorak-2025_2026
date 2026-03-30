import express from 'express'
import { adminLogin, approveRegistration, getPendingRegistrations, createNewAdmin, createNewService } from '../controllers/admin.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/login', adminLogin)

router.use(verifyToken)
router.use(verifyAdmin)

router.get('/pending', getPendingRegistrations)
router.patch('/approve/:id', approveRegistration)
router.post('/create-admin', createNewAdmin)
router.post('/create-service', createNewService)

export default router