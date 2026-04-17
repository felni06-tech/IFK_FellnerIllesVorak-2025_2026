import { db } from '../config/db.js'

export const AppointmentModel = {
    getAvailable: async () => {
        const [rows] = await db.execute(
            `SELECT
                a.id AS appointment_id,
                a.start_at,
                a.end_at,
                s.name AS service_name,
                s.description AS service_description,
                u.name AS provider_name,
                ps.price
            FROM appointments a
            JOIN provider_services ps ON a.provider_service_id = ps.id
            JOIN services s ON ps.service_id = s.id
            JOIN providers p ON ps.provider_id = p.id
            JOIN users u ON u.provider_id = p.id
            WHERE a.status = 'available' AND a.start_at > NOW()
            ORDER BY a.start_at ASC
            `
        )

        return rows
    },

    //Több időpont beszúrása egyszerre
    bulkCreate: async (slots) => {
        const [result] = await db.query(
            `INSERT INTO appointments
            (provider_service_id, user_id, start_at, end_at, status)
            VALUES ?`,
            [slots]
        )

        return result.insertId
    },

    // Megkeressuk a konkret idopontot es megnezzuk, hogy szabad-e
    findByIdAndCheckAvailable: async (appointmentId) => {
        const [rows] = await db.execute(
            `SELECT * FROM appointments WHERE id = ? AND status = 'available'`,
            [appointmentId]
        )

        return rows
    },

    // Statusz allitas, hogy ne lehessen tobbszor lefoglalni.
    updateStatus: async (userId, appointmentId, status, connection = db) => {
        await connection.execute(
            `UPDATE appointments SET user_id = ?, status = ? WHERE id = ?`,
            [userId, status, appointmentId]
        )
    }
}