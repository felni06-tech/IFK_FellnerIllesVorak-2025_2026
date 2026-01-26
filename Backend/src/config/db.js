import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

//Adatbázis kapcsolat létesítése

export const db = mysql.createPool({
    host: process.dotenv.DB_HOST || 'localhost',
    user: process.dotenv.DB_USER || 'root',
    password: process.dotenv.DB_PASSWORD || '',
    database: process.dotenv.DB_NAME || 'ifk_projekt2526',
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