// === DB 連線設定：src/db/connection.js ===
import mysql from 'mysql2/promise'

const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'bob',
  database: 'selection_analyzer',
  waitForConnections: true,
  connectionLimit: 10
})

export default db
