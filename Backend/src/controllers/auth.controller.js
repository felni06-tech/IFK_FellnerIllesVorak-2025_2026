import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../config/db'

// --- Regisztráció ---
export const register = async (req, res) => {
    const { name, email, password, phone, profile_type, profile_picture, profession } = req.body;

    // Alap ellenőrzés
    if (!name || !email || !password || !phone || !profile_type) {
            return res.status(400).json({ message: "Minden mező kitöltése kötelező!" });
    }

    try {
        // Van-e ilyen regisztráció?
        const [existing] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email])
        if(existing.length > 0) {
            return res.status(400).json({message: "Ez az email cím már foglalt."})
        }

        // Jelszó titkosítás
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        // Mentés az adatbázisba
        const connection = await db.getConnection()
        await connection.beginTransaction()

        try {
            const [userResult] = await connection.execute(
                `INSERT INTO users (profile_type, profile_picture, name, email, phone, password_hash, approved) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                 [profile_type, profile_picture || null, name, email, phone, passwordHash, 0]
            )

            const newUser_id = userResult.insertId

            //Ha szolgáltató akkor kell neki egy rekord a providers táblában is
            if(profile_type === 'provider') {
                await connection.execute(
                    `INSERT INTO providers (user_id, profession, avg_rating)
                    VALUES (?, ?, ?)`,
                    [newUser_id, profession, 0.0]
                )
            }

            await connection.commit()
            res.status(201).json({ message: "Sikeres regisztráció!", userid: newUser_id })

        } catch (err) {
            await connection.rollback()
            throw err
        } finally {
            connection.release()
        }

    } catch (error) {

    }

}

