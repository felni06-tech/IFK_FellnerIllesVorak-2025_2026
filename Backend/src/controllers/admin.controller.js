import { db } from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AdminModel } from '../models/admin.model.js'


export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        const admin = await AdminModel.findByEmail(email)
        if (!admin) {
            return res.status(401).json({ message: "Hibás admin azonosítók!" })
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash)
        if (!isMatch) {
            return res.status(401).json({ message: "Hibás admin azonosítók!" })
        }

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        )

        res.json({
            message: "Sikeres admin bejelentkezés!",
            token,
            admin: { id: admin.id, name: admin.name, email: admin.email }
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Szerver hiba az admin login közben." })
    }
}

// Lekérjük az összes olyan usert, aki még nincs jóváhagyva
export const getPendingRegistrations = async (req, res) => {
    try {
        const [users] = await db.execute("SELECT id, name, email, reg_date FROM users WHERE approved = 0")
        res.status(200).json(users)
    }
    catch (error) {
        res.status(500).json({ message: "Nem sikerült lekérni a listát." })
    }
}

export const approveRegistration = async (req, res) => {
    try {
        const { id } = req.params

        const [result] = await db.execute(
            "UPDATE users SET approved = 1 WHERE id = ?",
            [id]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Nem található ilyen jóváhagyásra váró regisztráció." })
        }

        res.status(200).json({ message: "Felhasználó jóváhagyásra került." })
    }
    catch (error) {
        res.status(500).json({ message: "Hiba a jóváhagyás során." })
    }
}

export const createNewAdmin = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body

        const existingAdmin = await AdminModel.findByEmail(email)

        if (existingAdmin) {
            return res.status(400).json({ message: "Ez az admin email már foglalt!" })
        }

        const password_hash = bcrypt.hash(password, 10)

        await db.execute(
            `INSERT INTO admins (name, email, phone, password_hash)
            VALUES (?, ?, ?, ?)`,
            [name, email, phone, password_hash]
        )

        res.status(200).json({ message: "Új admin létrehozása sikeres." })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Szerver hiba az admin létrehozásakor." })
    }
}