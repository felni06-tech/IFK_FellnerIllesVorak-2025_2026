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
    }
}