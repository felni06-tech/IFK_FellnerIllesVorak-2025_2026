import express from 'express'
import dotenv from 'dotenv'

//Útvonalak importálása
import authRoutes from './routes/auth.routes.js'


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


app.use((req,res) => {
    res.status(404).json({ message: "Az útvonal nem található." })
})

export default app