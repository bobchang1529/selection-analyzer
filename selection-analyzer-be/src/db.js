// === db.js ===
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'bob',
  database: 'selection_analyzer',
})