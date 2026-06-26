import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

// Parse DATABASE_URL: mysql://user:pass@host:port/database
const dbUrl = new URL(process.env.DATABASE_URL || "mysql://root:@localhost:3306/g_architects_db")

const pool = mysql.createPool({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port || "3306"),
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace("/", ""),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Return rows as plain objects
  typeCast: function (field: any, next: any) {
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1"
    }
    return next()
  },
})

export default pool
