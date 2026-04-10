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
    }
}