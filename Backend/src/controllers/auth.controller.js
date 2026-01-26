import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/auth.model'

// --- Regisztráció ---
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, profile_type, profile_picture, profession } = req.body;

        if (!name || !email || !password_hash || !phone || !profile_type) {
            return res.status(400).json({ message: "Minden mező kitöltése kötelező!" })
        }

        const existingUser = await UserModel.findByEmail(email)

        if (existingUser) {
            return res.status(400).json({ message: "Ez az e-mail már foglalt." })
        }

        const password_hash = await bcrypt.hash(password, 10)

        const userId = await UserModel.create({
            ...req.body,
            password_hash
        })

        res.status(201).json({ message: "Sikeres regisztráció!", userId })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba a regisztráció során." })
    }
}

// --- Bejelentkezés ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await UserModel.findByEmail(email)

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: "Hibás e-mail vagy jelszó!" })
        }

        const token = jwt.sign(
           { user_id: user.user_id, profile_type: user.profile_type },
           process.env.JWT_SECRET,
           { expiresIn: '24h' } 
        )

        res.json({
            token,
            user: { id: user.user_id, name: user.name, profile_type: user.profile_type}
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba történt a bejelentkezés során!" })
    }
}