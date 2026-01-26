import { db } from '../config/db'

const ProviderModel = {
    //Profil frissítése
    updateProfile: async (userId, data) => {
        const { address, profession, description } = data

        //Frissítjük a 'providers' táblát az 'user_id' alapján
        const [result] = await db.execute(
            `UPDATE providers
            SET address = ?, profession = ?, description = ?
            WHERE user_id = ?`,
            [address, profession, description, userId]
        )

        return result
    },

    getProfileByUserId: async (userId) => {
        const [rows] = await db.execute(
            `SELECT u.name, u.email, u.phone, u.profile_picture, provider.*
            FROM users u
            JOIN providers p ON u.user_id = p.user_id
            WHERE u.user_id = ?`,
            [userId]
        )

        return rows[0]
    }
}

export default ProviderModel