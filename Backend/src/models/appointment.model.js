import { db } from '../config/db.js'

export const AppointmentModel = {
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