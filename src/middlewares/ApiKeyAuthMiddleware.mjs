import ApiKeyService from '../services/ApiKeyService.mjs';
import ApiKeyErrors from '../utils/errors/ApiKeyErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';

const isAuthenticated = async (req, res, next) => {
    try {
        // Extract API key from headers
        const apiKey = req.headers['authorization'];

        if (!apiKey) {
            throw new Error(ApiKeyErrors.API_KEY_REQUIRED);
        }

        // Check if API key exists in the database
        const isApiKeyExist = await new ApiKeyService().isApiKeyExist(apiKey);

        if (!isApiKeyExist) {
            throw new Error(ApiKeyErrors.INVALID_API_KEY);
        }

        // Attach API key data to request
        req.apiKey = apiKey;
        next(); // Continue to the next middleware or route handler

    } catch (error) {
        return await ErrorResponse(error, res, 'api key auth middleware');
    }
};

export default isAuthenticated;
