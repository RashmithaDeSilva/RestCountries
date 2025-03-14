import ApiKeyDAO from '../DAOs/ApiKeyDAO.mjs';
import ApiKeyModel from '../models/ApiKeyModel.mjs';
import dotenv from 'dotenv';
import generateApiKey from '../utils/ApiKeyGenerator.mjs';
import ApiKeyErrors from '../utils/errors/ApiKeyErrors.mjs';

dotenv.config();

class ApiKeyService {
    constructor() {
        this.apiKeyDAO = new ApiKeyDAO();
    }

    // Create api key
    async createApiKey(userId, keyName) {
        try {
            let apiKey;
            let attempts = 0;
            const maxAttempts = Number(process.env.API_KEY_GENERATE_MAX_ATTEMPTS);

            do {
                // Generate api key
                apiKey = generateApiKey();

                // Check if key already exists
                const existingKey = await this.apiKeyDAO.isKeyExists(apiKey);
                if (!existingKey) break; // Exit loop if key is unique
                attempts++;

            } while (attempts < maxAttempts);

            if (attempts === maxAttempts) {
                throw new Error(ApiKeyErrors.FAILED_TO_GENERATE_A_API_KEY);
            }

            // Create api key model
            const apiKeyModel = new ApiKeyModel(userId, keyName, apiKey);

            // Save api key in database
            return await this.apiKeyDAO.create(apiKeyModel);

        } catch (error) {
            throw error;
        }
    }

    // Get api key by user id
    async getApiKeyByUserId(userId) {
        try {
            return await this.apiKeyDAO.getApiKeyByUserId(userId);
            
        } catch (error) {
            throw error;
        }
    }
}

export default ApiKeyService;
