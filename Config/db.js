import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Utilisation d'un pool de connexions pour gérer les requêtes simultanées et les reconnexions
const Db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'dressd',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default Db;
