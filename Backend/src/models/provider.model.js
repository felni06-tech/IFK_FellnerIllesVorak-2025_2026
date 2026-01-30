import { db } from '../config/db.js'

export const ProviderModel = {
    //Profil frissítése
    updateProfile: async (providerId, data) => {
        const { address, profession, description } = data

        //Frissítjük a 'providers' táblát a 'id' alapján
        const [result] = await db.execute(
            `UPDATE providers
            SET address = ?, profession = ?, description = ?
            WHERE id = ?`,
            [address, profession, description, providerId]
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