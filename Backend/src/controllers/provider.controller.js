import { ProviderModel } from '../models/provider.model.js'
import { ProviderServiceModel } from '../models/providerService.model.js'

export const getAllProviders = async (req, res) => {
    try {
        const providers = await ProviderModel.getAll()

        res.status(200).json({
            message: "Szolgáltatók lekérése sikeres.",
            providers
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba a szolgáltatók lekérdezésekor." })
    }
}

export const updateMyProfile = async (req, res) => {
    try {
        //A middleware fogja beletenni a requestbe a usert
        const providerId = req.user.provider_id
        const serviceId = req.user.service_id
        const { address, description, price, duration_minutes } = req.body

        if (!address || !price || !duration_minutes) {
            return res.status(400).json({ message: "A cím, ár és idő megadása kötelező!" })
        }

        await ProviderModel.updateProfile(providerId, { address, description })
        await ProviderServiceModel.updateDetails(providerId, serviceId, { price, duration_minutes })

        res.json({ message: "Profil sikeresen frissítve" })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba a profil frissítésekor." })
    }
}

export const getMyProfile = async (req, res) => {
    try {
        //A middleware fogja beletenni a requestbe a usert
        const providerId = req.user.provider_id
        const serviceId = req.user.service_id
        const profile = await ProviderModel.getProfileByProviderId(providerId, serviceId)

        if(!profile) {
            return res.status(404).json({ message: "Profil nem található" })
        }

        res.json(profile)
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba a profil lekérdezésekor." })
    }
}

export const getMyBookings = async (req, res) => {
    try {
        const providerId = req.user.provider_id

        const bookings = await ProviderModel.getBookings(providerId)

        res.status(200).json({
            message: "Foglalások sikeresen lekérdezve.",
            bookings
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba a foglalások lekérdezésekor." })
    }
}

export const getMyReviews = async (req, res) => {
    try {
        const providerId = req.user.provider_id

        const reviews = await ProviderModel.getReviews(providerId)

        res.status(200).json({
            message: "Vélemények sikeresen lekérdezve.",
            reviews
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba a vélemények lekérdezésekor." })
    }
}