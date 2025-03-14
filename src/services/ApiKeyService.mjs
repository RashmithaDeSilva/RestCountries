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
    async getApiKeysByUserId(userId) {
        try {
            return await this.apiKeyDAO.getApiKeysByUserId(userId);
            
        } catch (error) {
            throw error;
        }
    }

    // Chnge api key name
    async changeApiKeyByUserIdAndName(userId, data) {
        try {
            // Check old name or new name is exists
            const oldNameExist = await this.apiKeyDAO.isKeyExistsByUserIdAndKeyName(userId, data.old_api_key_name);
            const newNameExist = await this.apiKeyDAO.isKeyExistsByUserIdAndKeyName(userId, data.new_api_key_name);
            if (!oldNameExist) throw new Error(ApiKeyErrors.API_KEY_NAME_YOU_TRY_TO_CHANGE_IS_NOT_EXIST);
            if (newNameExist) throw new Error(ApiKeyErrors.NEW_API_KEY_NAME_YOU_ALREDY_USE);

            await this.apiKeyDAO.changeApiKeyByUserIdAndName(userId, data.old_api_key_name, data.new_api_key_name);

        } catch (error) {
            throw error;
        }
    }
}

export default ApiKeyService;
