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
        await AppointmentModel.updateStatus(appointmentId, "booked", connection)

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