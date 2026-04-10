import { ServiceModel } from "../models/service.model.js"

export const getAllServices = async (req, res) => {
    try {
        const services = await ServiceModel.getAll()

        res.status(200).json(services)
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Nem sikerült betölteni a szolgáltatásokat." })
    }
}