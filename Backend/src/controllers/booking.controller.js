import { db } from '../config/db.js'
import { AppointmentModel } from '../models/appointment.model.js'
import { BookingModel } from '../models/booking.model.js'

export const bookAppointment = async (req, res) => {
    const connection = await db.getConnection()

    try {
        const { appointmentId } = req.body
        const userId = req.user.id //Aki be van jelentkezve

        // Megnezzuk letezik-e az idopont, es hogy szabad-e meg

        const appointment = await AppointmentModel.findByIdAndCheckAvailable(appointmentId)

        if (!appointment) {
            return res.status(404).json({ message: "Az időpont nem található vagy már lefoglalták." })
        }


        // --- TRANZAKCIO INDITASA ---
        await connection.beginTransaction()

        // Foglalas letrehozasa
        const bookingId = await BookingModel.create({ appointmentId, userId }, connection)

        // Frissitjuk az idopontot 'booked' statuszra
        await AppointmentModel.updateStatus(userId, appointmentId, "booked", connection)

        await connection.commit()
        res.status(201).json({ message: "Sikeres foglalás!", bookingId })
    }
    catch (error) {
        await connection.rollback()
        console.error(error)
        res.status(500).json({ message: "Hiba történt a foglalás során."})
    }
    finally {
        connection.release()
    }
}

export const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id

        const bookings = await BookingModel.getByUserId(userId)

        res.status(200).json({ message: "Foglalások sikeresen lekérve.", bookings })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Nem sikerült lekérni a foglalásokat." })
    }
}

export const cancelBooking = async (req, res) => {
    const connection = await db.getConnection()
    try {
        const bookingId = req.params.id
        const userId = req.user.id

        // Foglalas keresese
        const booking = await BookingModel.findById(bookingId)

        if (!booking) {
            return res.status(404).json({ message: "A foglalás nem található." })
        }

        if (booking.user_id !== userId) {
            return res.status(403).json({ message: "Nincs jogosultságod a foglalás lemondásához." })
        }

        await connection.beginTransaction()

        await connection.execute(
            `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
            [bookingId]
        )

        await AppointmentModel.updateStatus(NULL, booking.appointment_id, 'available', connection)

        await connection.commit()

        res.status(200).json({ message: "Foglalás sikeresen lemondva, az időpont újra szabad." })
    }
    catch (error) {
        await connection.rollback()
        console.error(error)
        res.status(500).json({ message: "Hiba történt a lemondás során." })
    }
    finally {
        connection.release()
    }
}