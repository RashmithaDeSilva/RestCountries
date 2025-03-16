import { getDatabasePool } from '../config/SQLCon.mjs';

const pool = await getDatabasePool();

class ErrorLogDAO {
    constructor () {
    }

    async create (errorLog) {
        try {
            pool.query(`
                INSERT INTO error_logs (
                    location, 
                    message, 
                    stack, 
                    request_data
                ) values (?, ?, ?, ?)
            `, [errorLog.location, errorLog.message, errorLog.stack, 
                JSON.stringify(errorLog.requestData)]);

        } catch (error) {
            throw error;
        }
    }
}

export default ErrorLogDAO;