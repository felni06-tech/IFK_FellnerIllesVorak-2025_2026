import { ProviderModel } from '../models/provider.model'

export const updateMyProfile = async (req, res) => {
    try {
        //A middleware fogja beletenni a requestbe a usert
        const userId = req.user.user_id
        const { address, profession, description } = req.body

        if ()
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba a profil frissítésekor" })
    }
}