import { db } from '../config/db.js'

export const ProviderServiceModel = {
    //új szolgáltató hozzárendelése egy szolgáltatáshoz
    assingProvider: async (provider_id, service_id) => {
        const { provider_id, service_id, price, duration_minutes, details } = data
        const [result] = await db.execute(
            `INSERT INTO provider_services (provider_id, service_id, price, duration_minutes, details)
            VALUES (?, ?, ?, ?, ?)`,
            [provider_id, service_id, price, duration_minutes, details]
        )

        return result.insertId
    },

    //egy szolgáltatás összes szolgáltatójának kikeresése
    getByServiceId: async (serviceId) => {
        const [rows] = await db.execute(
           `SELECT 
                u.name AS provider_name, 
                u.profile_picture,
                p.address, 
                p.avg_rating,
                ps.price, 
                ps.duration_minutes, 
                ps.details,
                ps.id AS provider_service_id
            FROM provider_services ps
            JOIN providers p ON ps.provider_id = p.id
            JOIN users u ON u.provider_id = p.id
            WHERE ps.service_id = ? AND u.approved = 1`,
            [serviceId]
        )

        return rows
    }
}