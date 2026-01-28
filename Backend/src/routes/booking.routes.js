import express from 'express'
import { verifyToken, isProvider } from '../middlewares/auth.middleware'

const router = express.Router()

//Ez public route, bárki láthatja a szabad időpontokat
router.get('/available-appointments', (req, res) => {
    /* --- */
})

//Ez egy private route, token verifikáció szükséges (csak bejelentkezett ügyfél foglalhat)
router.post('/book', verifyToken, (req, res) => {
    const clientId = req.user.user_id
    res.json({ message: `Sikeres foglalt a(z) ${clientId} azonosítójú ügyfél.`})
})

//Ez egy private route, a tokenen kívűl azt is ellenőrizni kell,
//hogy a belépett személy Provider-e (csak szolgáltató tölthet fel új időpontokat)
router.post('/add-schedule', verifyToken, isProvider, (req, res) => {
    res.json({ message: "Az időpont sikeresen rögzítve a naptárba." })
})

export default router