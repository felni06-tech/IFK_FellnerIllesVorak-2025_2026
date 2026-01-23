import bcrypt from 'bcrypt'
import { db } from '../config/db'

export const register = async (req, res) => {
    const { name, email, password, phone, profile_type, profile_picture } = req.body;
}

if (!name || !email || !password || !phone || !profile_type) {
        return res.status(400).json({ message: "Minden mező kitöltése kötelező!" });
    }

const passwordHash = await bcrypt.hash(password, 10)

await db.execute(
    `INSERT INTO users (name, email, )`
)