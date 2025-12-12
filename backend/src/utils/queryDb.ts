import { ResultSetHeader, RowDataPacket } from "mysql2"
import { db } from "../config/mysql2.js"

export const queryDb = <T = RowDataPacket[] | ResultSetHeader>(query: string, values?: any[]): Promise<T> => {
    return new Promise((resolve, reject) => {
        db.query(query, values, (err, results) => {
            if (err) {
                reject(err)
            }else{
                resolve(results as T)
            }
        })
    })
}