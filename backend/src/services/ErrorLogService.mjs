import ErrorLogDAO from '../DAOs/ErrorLogDAO.mjs';
import ErrorLogModel from '../models/ErrorLogModel.mjs';
import { log } from '../utils/ConsoleLog.mjs';
import { LogTypes } from '../utils/enums/LogTypes.mjs';

class ErrorLogService {
    constructor() {
        this.errorLogDAO = new ErrorLogDAO();
    }

    // Create log
    async createLog(location, error, requestData = null) {
        try {
            const errorLog = new ErrorLogModel(location, error.message, 
                error.stack, requestData);
            await this.errorLogDAO.create(errorLog);

        } catch (error) {
            log(LogTypes.ERROR, `Failed to log error: ${ error }`);
        }
    }

    // Get error log count
    async getErrorLogCount() {
        try {
            const errorLogCount = await this.errorLogDAO.getErrorLogCount();
            return errorLogCount;
            
        } catch (error) {
            throw error;
        }
    }
}

export default ErrorLogService;
