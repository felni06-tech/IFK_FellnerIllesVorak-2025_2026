import { db } from '../config/db.js'

export const BookingModel = {
    create: async (data, connection = db) => {
        const { appointmentId, userId } = data
        const [result] = await connection.execute(
            `INSERT INTO bookings (appointment_id, user_id, status)
            VALUES (?, ?, 'active')`,
            [appointmentId, userId]
        )
    },

    // A felhasználó összes foglalásának lekérése minden infóval
    getByUserId: async (userId, connection = db) => {
        const [rows] = await connection.execute(
            `SELECT
                b.id AS booking_id,
                b.date AS booking_made_at,
                b.status AS booking_status,
                a.start_at,
                a.end_at,
                s.name AS service_name,
                u.name AS provider_name,
                p.address AS provider_address
            FROM bookings b
            JOIN appointments a on b.appointment_id = a.id
            JOIN provider_services ps ON a.provider_service_id = ps.id
            JOIN services s ON ps.service_id = s.id
            JOIN providers p ON ps.provider_id = p.id
            JOIN users u ON u.provider_id = p.id
            WHERE b.user_id = ? AND b.status != 'cancelled'
            ORDER BY a.start_at DESC`,
            [userId]
        )

        return rows
    },

    // Egy konkrét foglalás részletei (pl. lemondáshoz ellenőrizni, hogy kié)
    findById: async (bookingId) => {
        const [rows] = await db.execute(
            `SELECT * FROM bookings WHERE id = ?`,
            [bookingId]
        );
        return rows[0];
    }
}