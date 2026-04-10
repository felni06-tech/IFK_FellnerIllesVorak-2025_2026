import { db } from '../config/db.js'

export const ServiceModel = {
    getAll: async () => {
        const [rows] = await db.execute(
            `SELECT * FROM services`
        )

        return rows
    },

    findById: async (serviceId) => {
        const [rows] = await db.execute(
            `SELECT * FROM services
            WHERE id = ?`,
            [serviceId]
        )
        
        return rows[0]
    }
}