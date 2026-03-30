import { db } from '../config/db.js'

export const AdminModel = {
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            `SELECT * FROM admins WHERE email = ?`,
            [email]
        )

        return rows[0]
    }
}