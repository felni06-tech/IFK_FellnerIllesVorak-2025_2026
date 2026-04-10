import { db } from '../config/db.js'

export const UserModel = {
    //Felhasználó keresése e-mail alapján
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email])
        return rows[0]
    },

    //Új felhasználó létrehozása
    create: async (userData, connection = db) => {
        const { isProvider, name, email, phone, password_hash, profile_picture, profession} = userData
        let providerId = null

        //Ha provider akkor oda szúrunk be először
        if (isProvider) {
            const [providerResult] = await connection.execute(
                `INSERT INTO providers (profession, avg_rating)
                VALUES (?, ?)`,
                [profession || null, 0.0]
            )

            providerId = providerResult.insertId
        }

        //Mentés a 'users' táblába, a 'provider_id' null vagy pedig az előbb létrehozott rekord id-ja
        const [result] = await connection.execute(
            `INSERT INTO users ( provider_id, name, email, phone, password_hash, profile_picture)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [providerId, name, email, phone, password_hash, profile_picture || null]
        )

        const userId = result.insertId

        return { userId, providerId }
    } 
}