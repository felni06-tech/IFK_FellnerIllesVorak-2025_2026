import { AppointmentModel } from '../models/appointment.model.js'
import { ServiceModel } from '../models/service.model.js'

export const generateAppointments = async (req, res) => {
    try {
        const provider_id = req.user.provider_id
        const { service_id, start_time, end_time } = req.body

        if (!service_id || !start_time || !end_time) {
            return res.status(400).json({ message: "Hiányzó adatok. (szakma, kezdés, vég)" })
        }

        const serviceDetails = await ServiceModel.getProviderServiceDetails(provider_id, service_id)

        if (!serviceDetails) {
            return res.status(400).json({ message: "Ez a szolgáltatás nincs hozzárendelve az Ön profiljához." })
        }

        const { provider_service_id, duration_minutes } = serviceDetails
        const slots = []
        
        let current = new Date(start_time)
        const endLimit = new Date(end_time)

        //generálás a duration_minutes alapján
        while (new Date(current.getTime() + duration_minutes * 60000) <= endLimit) {
            const next = new Date(current.getTime() + duration_minutes * 60000)

            const startStr = current.toISOString().slice(0, 19).replace('T', ' ')
            const endStr = next.toISOString().slice(0, 19).replace('T', ' ')

            slots.push([provider_service_id, null, startStr, endStr, 'available'])

            current = next
        }

        if (slots.length === 0) {
            return res.status(400).json({ message: "Nem fér be egyetlen időpont sem a megadott sávba." })
        }

        await AppointmentModel.bulkCreate(slots)

        res.status(201).json({
            message: `Sikeresen generálva ${slots.length} időpont.`,
            count: slots.length
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba az időpontok generálásakor." })
    }
}