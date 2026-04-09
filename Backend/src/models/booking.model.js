import { db } from '../config/db.js'

export const BookingModel = {
    create: async (data, connection = db) => {
        const { appointmentId, userId } = data
        const [result] = await connection.execute(
            `INSERT INTO bookings (appointment_id, user_id, status)
            VALUES (?, ?, 'active')`
        )
    }
}