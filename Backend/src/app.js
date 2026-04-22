import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

//Útvonalak importálása
import authRoutes from './routes/auth.routes.js'
import serviceRoutes from './routes/service.routes.js'
import adminRoutes from './routes/admin.routes.js'
import providerRoutes from './routes/provider.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import reviewRoutes from './routes/review.routes.js'


dotenv.config()

const app = express()

//Middleware-ek
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
    console.log(`Beérkező kérés: ${req.method} ${req.url}`);
    next();
})

//Útvonalak
app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/provider', providerRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)

app.use((req,res) => {
    res.status(404).json({ message: "Az útvonal nem található." })
})

export default app