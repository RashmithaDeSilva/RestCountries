import ErrorLogDAO from '../DAOs/ErrorLogDAO.mjs';
import ErrorLogModel from '../models/ErrorLogModel.mjs';

class ErrorLogService {
    constructor() {
        this.errorLogDAO = new ErrorLogDAO();
    }

    // Create log
    async createLog(location, error, requestData) {
        try {
            const errorLog = new ErrorLogModel(location, error.message, 
                error.stack, requestData);
            await this.errorLogDAO.create(errorLog);

        } catch (error) {
            console.error("[ERROR] - Failed to log error: ", error);
        }
    }
}

export default ErrorLogService;
