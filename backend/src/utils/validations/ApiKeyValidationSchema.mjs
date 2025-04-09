import dotenv from "dotenv";

dotenv.config();
const API_KEY_NAME_MIN_CHARACTERS_SIZE = process.env.API_KEY_NAME_MIN_CHARACTERS_SIZE || 5;
const API_KEY_NAME_MAX_CHARACTERS_SIZE = process.env.API_KEY_NAME_MAX_CHARACTERS_SIZE || 50;

class ApiKeyValidationSchema {
    constructor() {}

    static oldApiKeyNameValidation() {
        return {
            old_api_key_name: {
                notEmpty: {
                    errorMessage: {
                        error: "Old API key name can't be empty!"
                    }
                },
                isString: {
                    errorMessage: {
                        error: "Old API key name must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(API_KEY_NAME_MIN_CHARACTERS_SIZE),
                        max: parseInt(API_KEY_NAME_MAX_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `Old API key name must be between ${ API_KEY_NAME_MIN_CHARACTERS_SIZE } and ${ API_KEY_NAME_MAX_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        };
    }

    static newApiKeyNameValidation() {
        return {
            new_api_key_name: {
                notEmpty: {
                    errorMessage: {
                        error: "New API key name can't be empty!"
                    }
                },
                isString: {
                    errorMessage: {
                        error: "New API key name must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(API_KEY_NAME_MIN_CHARACTERS_SIZE),
                        max: parseInt(API_KEY_NAME_MAX_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `New API key name must be between ${ API_KEY_NAME_MIN_CHARACTERS_SIZE } and ${ API_KEY_NAME_MAX_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        };
    }

    static apiKeyNameValidation() {
        return {
            api_key_name: {
                notEmpty: {
                    errorMessage: {
                        error: "API key name can't be empty!"
                    }
                },
                isString: {
                    errorMessage: {
                        error: "API key name must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(API_KEY_NAME_MIN_CHARACTERS_SIZE),
                        max: parseInt(API_KEY_NAME_MAX_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `API key name must be between ${ API_KEY_NAME_MIN_CHARACTERS_SIZE } and ${ API_KEY_NAME_MAX_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        };
    }
}

export default ApiKeyValidationSchema;
