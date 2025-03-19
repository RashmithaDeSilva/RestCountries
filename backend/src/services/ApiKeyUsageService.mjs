import ApiKeyUsageDAO from '../DAOs/ApiKeyUsageDAO.mjs';
import ApiKeyUsageError from '../utils/errors/ApiKeyUsageError.mjs';

class ApiKeyUsageService {
    constructor() {
        this.apiKeyUsageDAO = new ApiKeyUsageDAO();
    }

    // Check user can request
    async isUserCanRequest(userId) {
        try {
            const usageStatus = await this.apiKeyUsageDAO.isUserCanRequest(userId);
            if (!usageStatus) throw new Error(ApiKeyUsageError.API_KEY_REQUEST_LIMIT_EXCERDED);
            return usageStatus;
        } catch (error) {
            throw error;
        }
    }

    // Update api key usage
    async updateApiKeyUsage(userId) {
        try {
            const usageStatus = await this.isUserCanRequest(userId);
            if (usageStatus) await this.apiKeyUsageDAO.updateApiKeyUsage(userId);
        } catch (error) {
            throw error;
        }
    }
}

export default ApiKeyUsageService;
