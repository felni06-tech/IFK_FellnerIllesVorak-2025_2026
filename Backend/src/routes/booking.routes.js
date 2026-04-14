import { Router } from 'express';
import { bookAppointment, getUserBookings, cancelBooking } from '../controllers/booking.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router()

// Minden foglalással kapcsolatos útvonalhoz kell a bejelentkezés
router.use(verifyToken)

// Új foglalás létrehozása
// POST /api/bookings
router.post('/', bookAppointment)

// A bejelentkezett felhasználó saját foglalásainak lekérése
// GET /api/bookings/my-bookings
router.get('/my-bookings', getUserBookings)

// Foglalás lemondása
// DELETE vagy PATCH /api/bookings/:id
router.patch('/:id/cancel', cancelBooking)

export default router