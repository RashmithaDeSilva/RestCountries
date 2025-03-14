import StandardResponse from "./StandardResponse.mjs";
import DatabaseErrors from "../errors/DatabaseErrors.mjs";
import HashErrors from "../errors/HashErrors.mjs";
import CommonErrors from "../errors/CommonErrors.mjs";
import ErrorLogService from "../../services/ErrorLogService.mjs";
import ApiKeyErrors from "../errors/ApiKeyErrors.mjs";
import dotenv from 'dotenv';

dotenv.config();
const ENV = process.env.ENV || "PROD";
const errorLogService = new ErrorLogService();

// Log error in database
async function logError(location, error, data) {
    try {
        await errorLogService.createLog(location, error, data);

    } catch (error) {
        console.log("[ERROR] - ", error);
    }
}

// Response errors
async function ErrorResponse(error, res, location = null, data = null) {
    switch (error.message) {
        case CommonErrors.VALIDATION_ERROR:
            return res.status(400).send(StandardResponse(
                false,
                error.message,
                null,
                data
            ));

        case CommonErrors.AUTHENTICATION_FAILED:
            return res.status(401).send(StandardResponse(
                false,
                error.message,
                null,
                { redirect: `/api/${ process.env.API_VERSION }/auth` }
            ));

        case DatabaseErrors.EMAIL_ALREADY_EXISTS:
        case DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD:
        case DatabaseErrors.INVALID_EMAIL_ADDRESS:
        case HashErrors.INVALID_OLD_PASSWORD:
            return res.status(400).send(StandardResponse(
                false,
                error.message,
                null,
                null 
            ));

        case CommonErrors.NOT_FOUND:
            return res.status(404).send(StandardResponse(
                false,
                error.message,
                null,
                { redirect: `/api/${ process.env.API_VERSION }/auth` }
            ));

        case DatabaseErrors.USER_NOT_FOUND:
            return res.status(404).send(StandardResponse(
                false,
                error.message,
                null,
                { redirect: `/api/${ process.env.API_VERSION }/auth` }
            ));

        case ApiKeyErrors.API_KEY_NAME_YOU_TRY_TO_CHANGE_IS_NOT_EXIST:
            return res.status(404).send(StandardResponse(
                false,
                error.message,
                null,
                null
            ));
        
        case ApiKeyErrors.NEW_API_KEY_NAME_YOU_ALREDY_USE:
            return res.status(409).send(StandardResponse(
                false,
                error.message,
                null,
                null
            ));
        
        case HashErrors.HASHING_FAILED:
        case HashErrors.HASH_VERIFICATION_FAILED:
        case ApiKeyErrors.FAILED_TO_GENERATE_A_API_KEY:
            await logError(location, error, data);
            return res.status(500).send(StandardResponse(
                false,
                CommonErrors.INTERNAL_SERVER_ERROR,
                null,
                ENV === "DEV" ? error.message : null // Only expose internal error messages in DEV
            ));

        default:
            await logError(location, error, data);
            return res.status(500).send(StandardResponse(
                false,
                CommonErrors.INTERNAL_SERVER_ERROR,
                null,
                ENV === "DEV" ? error.message : null // Only expose internal error messages in DEV
            ));
    }
}

export default ErrorResponse;
