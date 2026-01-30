import { ProviderModel } from '../models/provider.model'

export const updateMyProfile = async (req, res) => {
    try {
        //A middleware fogja beletenni a requestbe a usert
        const providerId = req.user.providerId
        const { address, profession, description } = req.body

        if (!address || !profession) {
            return res.status(400).json({ message: "A cím és a szakma megadása kötelező!" })
        }

        await ProviderModel.updateProfile(userId, { address, profession, description })

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
        const profile = await ProviderModel.getProfileByProviderId(userId)

        if(!profile) {
            return res.status(404).json({ message: "Profil nem található" })
        }

        res.json(profile)
    }
    catch (error) {
        res.status(500).json({ message: "Hiba a profil lekérdezésekor." })
    }
}