import ApiKeyService from '../services/ApiKeyService.mjs';
import ApiKeyErrors from '../utils/errors/ApiKeyErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';

const isAuthenticated = async (req, res, next) => {
    try {
        const apiKeyService = new ApiKeyService();

        // Extract API key from headers
        const apiKey = req.headers['authorization'];

        if (!apiKey) {
            throw new Error(ApiKeyErrors.API_KEY_REQUIRED);
        }

        // Check if API key exists in the database
        const isApiKeyExist = await apiKeyService.isApiKeyExist(apiKey);

        if (!isApiKeyExist) {
            throw new Error(ApiKeyErrors.INVALID_API_KEY);
        }

        // Get user id using api key
        const userId = await apiKeyService.getUserIdByApiKey(apiKey);

        // Attach API key data to request
        req.apiKey = apiKey;
        req.user = {
            "id": userId
        };
        next(); // Continue to the next middleware or route handler

    } catch (error) {
        return await ErrorResponse(error, res, 'api key auth middleware');
    }
};

export default isAuthenticated;
