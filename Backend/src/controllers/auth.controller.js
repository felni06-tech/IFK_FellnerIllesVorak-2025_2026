import bcrypt from 'bcrypt'
import { db } from '../config/db'

export const register = async (req, res) => {
    const { name, email, password, phone, profile_type, profile_picture } = req.body;


    if (!name || !email || !password || !phone || !profile_type) {
            return res.status(400).json({ message: "Minden mező kitöltése kötelező!" });
    }

    try {
        const [existing] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email])
        if(existing.length > 0) {
            return res.status(400).json({message: "Ez az email cím már foglalt."})
        }

        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        const connection = await db.getConnection()

    } catch (error) {

    }

}