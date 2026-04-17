import { AppointmentModel } from '../models/appointment.model.js'
import { ProviderServiceModel } from '../models/providerService.model.js'

export const getAvailableAppointments = async (req, res) => {
    try {
        const appointments = await AppointmentModel.getAvailable()
        res.status(200).json({
            message: "Időpontok lekérdezése sikeres.",
            appointments
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba az időpontok lekérésekor." })
    }
}

export const generateAppointments = async (req, res) => {
    try {
        const providerId = req.user.provider_id
        const serviceId = req.user.service_id
        const { start_time, end_time } = req.body

        if ( !start_time || !end_time) {
            return res.status(400).json({ message: "Hiányzó adatok. (kezdés, vég)" })
        }

        if (new Date(`1970-01-01T${end_time}`) <= new Date(`1970-01-01T${start_time}`)) {
            return res.status(400).json({ message: "A befejezési időpontnak később kell lennie, mint a kezdési időpontnak!" })
        }

        const serviceDetails = await ProviderServiceModel.getProviderServiceDetails(providerId, serviceId)

        if (!serviceDetails) {
            return res.status(400).json({ message: "Ez a szolgáltatás nincs hozzárendelve az Ön profiljához." })
        }

        const { provider_service_id, duration_minutes, price } = serviceDetails
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
            count: slots.length,
            price
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba az időpontok generálásakor." })
    }
}