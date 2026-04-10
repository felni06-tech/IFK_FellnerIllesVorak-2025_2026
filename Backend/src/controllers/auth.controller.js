import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../config/db.js'
import { UserModel } from '../models/user.model.js'
import { ServiceModel } from '../models/service.model.js'
import { ProviderServiceModel } from '../models/providerService.model.js'


// --- Regisztráció ---
export const register = async (req, res) => {
    const connection = await db.getConnection()
    
    try {
        const { isProvider, name, email, password, phone, profile_picture, service_id } = req.body;

        //Hiányzó adatok kezelése
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "A név, email, jelszó, telefonszám mezők kitöltése kötelező." })
        }

        //Szolgáltatóknál kötelező a szakma is
        if (isProvider && !service_id) {
            return res.status(400).json({ message: "Szolgáltatóknak a szakma kiválasztása kötelező." })
        }

        let profession = ""

        if (service_id) {
            const service = await ServiceModel.findById(service_id)

            if (service) {
                profession = service.name
            }
        }

        //Nem árt ha nincs két ugyanolyan felhasználó
        const existingUser = await UserModel.findByEmail(email)

        if (existingUser) {
            return res.status(400).json({ message: "Ez az e-mail már foglalt." })
        }

        const password_hash = await bcrypt.hash(password, 10)

        await connection.beginTransaction()

        const { userId, providerId } = await UserModel.create({
            ...req.body,
            profession,
            password_hash
        }, connection)

        //Szolgáltató és szolgáltatás kapcsolatának létrehozása
        let providerServiceId = null

        if (providerId != null && service_id) {
            providerServiceId = await ProviderServiceModel.create(providerId, service_id, connection)
        }

        await connection.commit()

        res.status(201).json({
            message: "Sikeres regisztráció!",
            userId,
            providerId,
            providerServiceId,
            isPending: true
        })
    }
    catch (error) {
        await connection.rollback()
        console.error(error)
        res.status(500).json({ message: "Hiba a regisztráció során." })
    }
    finally {
        connection.release()
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

        let serviceId = null

        if (user.provider_id != null) {
            const serviceData = await ProviderServiceModel.getByProviderId(user.provider_id)

            serviceId = serviceData && serviceData.length > 0 ? serviceData[0].service_id : null
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                provider_id: user.provider_id,
                service_id: serviceId
            },
           process.env.JWT_SECRET,
           { expiresIn: '24h' } 
        )

        res.json(
        {
            token,
            user: {
                id: user.id,
                name: user.name,
                isProvider: user.provider_id != null,
                providerId: user.provider_id,
                serviceId
            }
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba történt a bejelentkezés során!" })
    }
}