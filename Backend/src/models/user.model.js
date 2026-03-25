import { db } from '../config/db.js'

export const UserModel = {
    //Felhasználó keresése e-mail alapján
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            `SELECT u.*, p.provider_id
             FROM users u
             LEFT JOIN providers p ON p.user_id = u.user_id
             WHERE u.email = ?`,
            [email]
        )
        return rows[0]
    },

    //Új felhasználó létrehozása
    create: async (userData) => {
        const { isProvider, name, email, phone, password_hash, profile_picture, profession} = userData

        const connection = await db.getConnection()
        await connection.beginTransaction()

        try {

            // Users táblába szúrás először
            const profileType = isProvider ? 'provider' : 'user'
            const [result] = await connection.execute(
                `INSERT INTO users (profile_type, name, email, phone, password_hash, profile_picture)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [profileType, name, email, phone, password_hash, profile_picture || null]
            )

            const userId = result.insertId
            let providerId = null

            // Ha provider, hozzáadunk a providers táblához
            if (isProvider) {
                const [providerResult] = await connection.execute(
                    `INSERT INTO providers (user_id, profession, avg_rating)
                    VALUES (?, ?, ?)`,
                    [userId, profession || null, 0.0]
                )

                providerId = providerResult.insertId
            }

            await connection.commit()
            return { userId, providerId }
            
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    } 
}