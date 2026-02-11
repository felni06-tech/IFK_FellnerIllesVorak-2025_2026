import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.model.js'
import { ServiceModel } from '../models/service.model.js'
import { AdminModel } from '../models/admin.model.js'

// --- Regisztráció ---
export const register = async (req, res) => {
    try {
        const { isProvider, name, email, password, phone, profile_picture, service_id } = req.body;

        //Hiányzó adatok kezelése
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "Minden mező kitöltése kötelező!" })
        }

        //Szolgáltatóknál kötelező a szakma is
        if (isProvider) {
            const service = await ServiceModel.findById(service_id)

            if (!service) {
                return res.status(400).json({ message: "Érvénytelen szakma!" })
            }

            req.body.profession = service.name
        }

        //Nem árt ha nincs két ugyanolyan felhasználó
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

        //Hiányzó adatok kezelése
        if (!email || !password) {
            return res.status(400).json({ message: "E-mail és jelszó szükséges!" })
        }

        const user = await UserModel.findByEmail(email)

        //Hibás adatok kezelése
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: "Hibás e-mail vagy jelszó!" })
        }

        //Csak jóváhagyott ember tudjon belépni
        if (user.approved === 0) {
            return res.status(403).json({ message: "Fiókod jóváhagyásra vár." })
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                provider_id: user.provider_id
            },
           process.env.JWT_SECRET,
           { expiresIn: '24h' } 
        )

        res.json(
        {
            token,
            user: { id: user.id, name: user.name, isProvider: user.provider_id != null }
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba történt a bejelentkezés során!" })
    }
}

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