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
    getProfileByProviderId: async (providerId) => {
        const [rows] = await db.execute(
            `SELECT u.name, u.email, u.phone, u.profile_picture,
            p.id as provider_id, p.address, p.profession, p.description, p.avg_rating
            FROM users u
            JOIN providers p ON u.provider_id = p.id
            WHERE p.id = ?`,
            [providerId]
        )

        return rows[0]
    }
}