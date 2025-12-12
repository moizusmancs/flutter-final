import mysql from "mysql2"

export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "macbookmoiz2002",
    database: "vouge"    
})