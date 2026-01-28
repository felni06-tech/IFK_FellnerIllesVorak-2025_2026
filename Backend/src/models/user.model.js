import { db } from '../config/db'

export const UserModel = {
    //Felhasználó keresése e-mail alapján
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email])
        return rows[0]
    },

    //Új felhasználó létrehozása
    create: async (userData) => {
        const { provider_id, name, email, phone, password_hash, profile_picture } = userData

        const connection = await db.getConnection()
        await connection.beginTransaction()

        try {
            //Mentés az users táblába
            const [result] = await connection.execute(
                `INSERT INTO users ( provider_id, name, email, phone, password_hash, profile_picture)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [provider_id || null, name, email, phone, password_hash, profile_picture]
            )

            const userId = result.insertId

            //Ha szolgáltatói profil akkor oda is hozzá kell adnunk
            if (provider_id != null) {
                await connection.execute(
                    `INSERT INTO providers (user_id, avg_rating)
                    VALUES (?, ?)`,
                    [userId, profession, 0.0]
                )
            }

            await connection.commit()
            return userId

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    } 
}