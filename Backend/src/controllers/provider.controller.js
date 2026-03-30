import { ProviderModel } from '../models/provider.model.js'

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
        const { address, description } = req.body

        if (!address) {
            return res.status(400).json({ message: "A cím és a szakma megadása kötelező!" })
        }

        await ProviderModel.updateProfile(providerId, { address, description })

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
        const profile = await ProviderModel.getProfileByProviderId(providerId)

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