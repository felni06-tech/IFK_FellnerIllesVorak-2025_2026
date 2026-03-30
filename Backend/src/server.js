import app from './app.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('-----------------------------------------')
    console.log(`Fut a szerver: http://localhost:${PORT}`)
    console.log('Időpontfoglaló rendszer backend elindítása sikeres.')
    console.log('-----------------------------------------')
})