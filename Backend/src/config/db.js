import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

//Adatbázis kapcsolat létesítése
export const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ifk_projekt2526',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

//Adatbázis kapcsolat ellenőrzése
db.getConnection()
    .then(connection => {
        console.log('Sikeres csatlakozás az adatbázishoz.')
        connection.release()
    })
    .catch(err => {
        console.error('Hiba történt az adatbázishoz való csatlakozáskor:', err.message)
    })