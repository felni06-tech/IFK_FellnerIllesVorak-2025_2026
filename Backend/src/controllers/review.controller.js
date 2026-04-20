import { ProviderServiceModel } from "../models/providerService.model.js"
import { ReviewModel } from "../models/review.model.js"

export const addReview = async (req, res) => {
    try {
        const { providerId, serviceId, rating, comment } = req.body
        const userId = req.user.id

        if (!providerId || !serviceId || !rating) {
            return res.status(400).json({ message: "Szolgáltató, szolgáltatás és értékelés megadása kötelező." })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Az értékelésnek 1 és 5 között kell lennie." })
        }

        const psDetails = await ProviderServiceModel.getProviderServiceDetails(providerId, serviceId)
        const providerServiceId = psDetails.provider_service_id

        const reviewId = await ReviewModel.create({
            providerServiceId,
            userId,
            rating,
            comment: comment || null
        })

        res.status(200).json({ message: "Értékelés sikeresen rögzítve.", reviewId })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Hiba az értékelés rögzítésekor." })
    }
}