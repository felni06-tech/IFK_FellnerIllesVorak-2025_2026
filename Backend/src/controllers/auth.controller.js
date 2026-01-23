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

// --- Bejelentkezés ---
export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        // Felhasználó keresés
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email])
        if(users.length === 0) {
            return res.status(401).json({ message: "Hibás email vagy jelszó!" })
        }

        const user = users[0]

        //Jelszó ellenőrzés
        const isMatch = await bcrypt.compare(password, user.password_hash)
        if(!isMatch) {
            return res.status(401).json({ message: "Hibás email vagy jelszó!" })
        }

        //Token generálás
        const token = jwt.sign(
            { user_id: user.user_id, profile_type: user.profile_type },
            process.env.JWT_SECRET || 'ifk_super_secret_key',
            { expiresIn: '1d' }
        )

        //Válasz küldése
        res.status(200).json({
            message: "Sikeres bejelentkezés!",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                profile_type: user.profile_type,
                approved: user.approved
            }
        })

    } catch (error) {
        console.error("Auth Login Error:", error)
        res.status(500).json({ message: "Hiba történt a bejelentkezés során." })
    }
}