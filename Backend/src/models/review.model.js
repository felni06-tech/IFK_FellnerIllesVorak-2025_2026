import { db } from '../config/db.js'

export const ReviewModel = {
    create: async (data, connection = db) => {
        const { providerServiceId, userId, rating, comment } = data

        const [result] = await connection.execute(
            `INSERT INTO reviews (provider_service_id, user_id, rating, comment)
            VALUES (?, ?, ?, ?)`,
            [providerServiceId, userId, rating, comment]
        )

        return result.insertId
    }
}