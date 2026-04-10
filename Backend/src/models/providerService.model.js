import { db } from '../config/db.js'

export const ProviderServiceModel = {
    //új szolgáltató és szolgáltatás kapcsolatának létrehozása
    create: async (provider_id, service_id, connection = db) => {
        const [result] = await connection.execute(
            `INSERT INTO provider_services (provider_id, service_id, price, duration_minutes)
            VALUES (?, ?, ?, ?)`,
            [provider_id, service_id, null, null] //price, duration_minutes profil frissítéssel kell megadni
        )

        return result.insertId
    },

    updateDetails: async (providerId, serviceId, data) => {
        const { price, duration_minutes } = data

        const [result] = await db.execute(
            `UPDATE provider_services
            SET price = ?, duration_minutes = ?
            WHERE provider_id = ? AND service_id = ?`,
            [price, duration_minutes, providerId, serviceId]
        )

        return result
    },

    getByProviderId: async (providerId) => {
        const [rows] = await db.execute(
            `SELECT * FROM provider_services
            WHERE provider_id = ?`,
            [providerId]
        )

        return rows
    },

    //egy szolgáltatás összes szolgáltatójának kikeresése
    getByServiceId: async (serviceId) => {
        const [rows] = await db.execute(
            `SELECT 
                u.name AS provider_name, 
                u.profile_picture,
                p.address, 
                p.profession,
                p.description, 
                p.avg_rating,
                ps.price, 
                ps.duration_minutes, 
                ps.id AS provider_service_id
            FROM provider_services ps
            JOIN providers p ON ps.provider_id = p.id
            JOIN users u ON u.provider_id = p.id
            WHERE ps.service_id = ? AND u.approved = 1`,
            [serviceId]
        )

        return rows
    },

    getProviderServiceDetails: async (provider_id, service_id) => {
        const [rows] = await db.execute(
            `SELECT id AS provider_service_id, duration_minutes, price 
             FROM provider_services 
             WHERE provider_id = ? AND service_id = ?`,
            [provider_id, service_id]
        )
        return rows[0]
    }
}