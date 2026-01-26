import { db } from '../config/db'

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email])
        return rows[0]
    },

    create: async (userData) => {
        const { name, email, phone, password_hash, profile_type, profile_picture, profession } = userData

        const connection = await db.getConnection()
        await connection.beginTransaction()

        try {
            const [result] = await connection.execute(
                `INSERT INTO users (profile_type, profile_picture, name, email, phone, password_hash)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [profile_type, profile_picture || null, name, email, phone, password_hash]
            )

            const userId = result.insertId

            if (profile_type === 'provider') {
                await connection.execute(
                    `INSERT INTO providers (user_id, profession, avg_rating)
                    VALUES (?, ?, ?)`,
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