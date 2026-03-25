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
            WHERE service_id = ?`,
            [serviceId]
        )
        
        return rows[0]
    },

    // Megkeresi a kapcsolótábla ID-t és a hosszt a két külső ID alapján
    getProviderServiceDetails: async (provider_id, service_id) => {
        const [rows] = await db.execute(
            `SELECT ps.provider_service_id, COALESCE(ps.duration_minutes, 30) AS duration_minutes 
             FROM provider_services ps
             WHERE ps.provider_id = ? AND ps.service_id = ?`,
            [provider_id, service_id]
        )
        return rows[0] // Ha létezik a kapcsolat, visszaadja az objektumot
    }
}
