import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

//Útvonalak importálása
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import providerRoutes from './routes/provider.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'
import serviceRoutes from './routes/service.routes.js'


dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendPath = path.resolve(__dirname, '../../Frontend')

const app = express()

//Middleware-ek
app.use(express.json())
app.use((req, res, next) => {
    console.log(`Beérkező kérés: ${req.method} ${req.url}`);
    next();
})

// Fejlesztes kozben mindig a friss frontend fajlokat adja vissza.
app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path.endsWith('.js') || req.path.endsWith('.css') || req.path === '/admin' || req.path === '/admin/') {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        res.set('Pragma', 'no-cache')
        res.set('Expires', '0')
    }
    next()
})

//Útvonalak
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/provider', providerRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/services', serviceRoutes)

// Frontend statikus kiszolgalas localhost:3000 alatt
app.use(express.static(frontendPath))

app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(frontendPath, 'admin', 'index.html'))
})


app.use((req,res) => {
    res.status(404).json({ message: "Az útvonal nem található." })
})

export default app