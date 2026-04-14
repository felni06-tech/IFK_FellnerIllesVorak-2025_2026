import express from 'express'
import dotenv from 'dotenv'

//Útvonalak importálása
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import providerRoutes from './routes/provider.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'
import bookingRoutes from './routes/booking.routes.js'


dotenv.config()

const app = express()

//Middleware-ek
app.use(express.json())
app.use((req, res, next) => {
    console.log(`Beérkező kérés: ${req.method} ${req.url}`);
    next();
})

//Útvonalak
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/provider', providerRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/bookings', bookingRoutes)


app.use((req,res) => {
    res.status(404).json({ message: "Az útvonal nem található." })
})

export default app