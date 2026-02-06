import { ProviderServiceModel } from "../models/providerservice.model.js"

export const addProviderConnection = async (req, res) => {
    try {
        const { service_id, price, duration_minutes, details } = req.body
        //middlewareből jön
        const provider_id = req.user.provider_id

        if (!provider_id) {
            return res.status(400).json({ message: "Csak szolgáltatókhoz lehet szolgáltatást rendelni!" })
        }

        if (!service_id || !price || !duration_minutes) {
            return res.status(400).json({ message: "Minden adat megadása kötelező!" })
        }

        const insertId = await ProviderServiceModel.create({
            provider_id,
            service_id,
            price,
            duration_minutes,
            details
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba történt az összekapcsolás közben." })
    }
}