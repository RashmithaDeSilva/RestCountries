import { getDatabasePool } from '../config/SQLCon.mjs';

const pool = await getDatabasePool();

class ErrorLogDAO {
    constructor () {
    }

    // Create error log
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

    // Get error log count
    async getErrorLogCount() {
        try {
            const [row] = await pool.query(`SELECT COUNT(*) AS count FROM error_logs`);
            return row[0].count;

        } catch (error) {
            throw error;
        }
    }

}

export default ErrorLogDAO;