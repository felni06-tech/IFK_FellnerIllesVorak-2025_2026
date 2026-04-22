import { db } from '../config/db.js'

export const ProviderModel = {
    getAll: async () => {
        const [rows] = await db.execute(
            `SELECT * FROM providers`
        )

        return rows
    },
    //Profil frissítése
    updateProfile: async (providerId, data) => {
        const { address, description } = data

        //Frissítjük a 'providers' táblát a 'id' alapján
        const [result] = await db.execute(
            `UPDATE providers
            SET address = ?, description = ?
            WHERE id = ?`,
            [address, description, providerId]
        )

        return result
    },

    //Lekérdezzük a profil összes adatát 'id' alapján
    getProfileByProviderId: async (providerId, serviceId) => {
        const [rows] = await db.execute(
            `SELECT p.*, ps.price, ps.duration_minutes 
            FROM providers p
            JOIN provider_services ps ON p.id = ps.provider_id
            WHERE p.id = ? AND ps.service_id = ?`,
            [providerId, serviceId]
        )

        return rows[0]
    },

    getBookings: async (providerId, connection = db) => {
        const [rows] = await connection.execute(
            `SELECT
                b.id AS booking_id,
                b.status AS booking_status,
                b.date AS booking_made_at,
                a.start_at,
                a.end_at,
                s.name AS service_name,
                u.name AS customer_name,
                u.email AS customer_email
            FROM bookings b
            JOIN appointments a ON b.appointment_id = a.id
            JOIN provider_services ps ON a.provider_service_id = ps.id
            JOIN services s ON ps.service_id = s.id
            JOIN users u ON b.user_id = u.id
            WHERE ps.provider_id = ?
            AND b.status != 'cancelled'
            ORDER BY a.start_at DESC`,
            [providerId]
        )

        return rows
    },

    getReviews: async (providerId, connection = db) => {
        const [rows] = await connection.execute(
            `SELECT
                r.id AS review_id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS customer_name,
                s.name AS service_name
            FROM reviews r
            JOIN provider_services ps ON r.provider_service_id = ps.id
            JOIN services s ON ps.service_id = s.id
            JOIN users u ON r.user_id = u.id
            WHERE ps.provider_id = ?
            ORDER BY r.created_at DESC`,
            [providerId]
        )

        return rows
    }
}