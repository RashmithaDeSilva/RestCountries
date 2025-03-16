import StandardResponse from "./StandardResponse.mjs";
import DatabaseErrors from "../errors/DatabaseErrors.mjs";
import HashErrors from "../errors/HashErrors.mjs";
import CommonErrors from "../errors/CommonErrors.mjs";
import ErrorLogService from "../../services/ErrorLogService.mjs";
import ApiKeyErrors from "../errors/ApiKeyErrors.mjs";
import CacheStoreErrors from "../errors/CacheStoreErrors.mjs";
import RestCountryErrors from "../errors/RestCountryErrors.mjs";
import { LogTypes } from "../types/LogTypes.mjs";
import { log } from "../ConsoleLog.mjs";
import dotenv from 'dotenv';

dotenv.config();
const ENV = process.env.ENV || "PROD";
const API_VERSION = process.env.API_VERSION || 'v1';
const errorLogService = new ErrorLogService();

// Log error in database
async function logError(location, error, data) {
    try {
        await errorLogService.createLog(location, error, data);

    } catch (error) {
        log(LogTypes.ERROR, error);
    }
}

// Response errors
async function ErrorResponse(error, res, location = null, data = null) {
    try {
        switch (error.message) {
            case CommonErrors.VALIDATION_ERROR:
                return res.status(400).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    data
                ));
    
            case CommonErrors.AUTHENTICATION_FAILED:
            case ApiKeyErrors.INVALID_API_KEY:
                return res.status(401).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    { redirect: `/api/${ API_VERSION }/auth` }
                ));
    
            case DatabaseErrors.EMAIL_ALREADY_EXISTS:
            case DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD:
            case DatabaseErrors.INVALID_EMAIL_ADDRESS:
            case HashErrors.INVALID_OLD_PASSWORD:
            case ApiKeyErrors.API_KEY_REQUIRED:
                return res.status(400).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    null 
                ));
    
            case CommonErrors.NOT_FOUND:
            case DatabaseErrors.USER_NOT_FOUND:
                return res.status(404).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    { redirect: `/api/${ API_VERSION }/auth` }
                ));

            case RestCountryErrors.COUNTRY_NOT_FOUND:
                return res.status(404).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    null
                ));
    
            case ApiKeyErrors.API_KEY_NAME_YOU_TRY_TO_CHANGE_IS_NOT_EXIST:
            case ApiKeyErrors.API_KEY_NAME_NOT_FOUND:
                return res.status(404).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    null
                ));
    
            case ApiKeyErrors.INVALID_API_KEY:
                return res.status(403).send(StandardResponse(
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
            
            case ApiKeyErrors.API_KEY_CREATION_LIMIT_EXCEEDED:
                return res.status(429).send(StandardResponse(
                    false,
                    error.message,
                    null,
                    "You have reached the maximum number of API keys allowed. Please delete an existing key or contact support."
                ));
            
            case HashErrors.HASHING_FAILED:
            case HashErrors.HASH_VERIFICATION_FAILED:
            case ApiKeyErrors.FAILED_TO_GENERATE_A_API_KEY:
            case CacheStoreErrors.FAILED_TO_FETCH_DATA:
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
        
    } catch (error) {
        log(LogTypes.ERROR, error);
        return res.status(500).send(StandardResponse(
            false,
            CommonErrors.INTERNAL_SERVER_ERROR,
            null,
            ENV === "DEV" ? error.message : null // Only expose internal error messages in DEV
        ));
    }
}

export default ErrorResponse;
