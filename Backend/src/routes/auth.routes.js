import express from 'express'
import { register, login, adminLogin } from '../controllers/auth.controller.js'

const router = express.Router()

// Regisztráció: POST /api/auth/register
router.post('/register', register)

//Bejelentkezés: POST /api/auth/login
router.post('/login', login)

router.post('/admin/login', adminLogin)

//Kijelentkezés (token törlése kliens oldalon történik)
router.post('/logout', (req, res) => {
    res.status(200).json({ message: "Sikeres kijelentkezés!" })
})

export default router