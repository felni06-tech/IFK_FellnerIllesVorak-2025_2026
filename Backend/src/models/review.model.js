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
    },

    updateProviderAverageRating: async (providerId, connection = db) => {
        await connection.execute(
            `UPDATE providers
            SET avg_rating = (
                SELECT avg(r.rating)
                FROM reviews r
                JOIN provider_services ps ON r.provider_service_id = ps.id
                WHERE ps.provider_id = ?
            )
            WHERE id = ?`,
            [providerId, providerId]
        )
    }
}