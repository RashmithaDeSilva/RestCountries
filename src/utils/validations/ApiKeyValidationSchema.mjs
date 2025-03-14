import dotenv from "dotenv";

dotenv.config();
const API_KEY_NAME_MIN_CHARACTERS_SIZE = process.env.API_KEY_NAME_MIN_CHARACTERS_SIZE;
const API_KEY_NAME_MAX_CHARACTERS_SIZE = process.env.API_KEY_NAME_MAX_CHARACTERS_SIZE;

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
                        min: parseInt(API_KEY_NAME_MIN_CHARACTERS_SIZE || 5),
                        max: parseInt(API_KEY_NAME_MAX_CHARACTERS_SIZE || 50)
                    },
                    errorMessage: {
                        error: `Old API key name must be between ${ API_KEY_NAME_MIN_CHARACTERS_SIZE || 5 } and ${ API_KEY_NAME_MAX_CHARACTERS_SIZE || 50 } characters!`
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
                        min: parseInt(API_KEY_NAME_MIN_CHARACTERS_SIZE || 5),
                        max: parseInt(API_KEY_NAME_MAX_CHARACTERS_SIZE || 50)
                    },
                    errorMessage: {
                        error: `New API key name must be between ${ API_KEY_NAME_MIN_CHARACTERS_SIZE || 5 } and ${ API_KEY_NAME_MAX_CHARACTERS_SIZE || 50 } characters!`
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
                        min: parseInt(API_KEY_NAME_MIN_CHARACTERS_SIZE || 5),
                        max: parseInt(API_KEY_NAME_MAX_CHARACTERS_SIZE || 50)
                    },
                    errorMessage: {
                        error: `API key name must be between ${ API_KEY_NAME_MIN_CHARACTERS_SIZE || 5 } and ${ API_KEY_NAME_MAX_CHARACTERS_SIZE || 50 } characters!`
                    }
                }
            }
        };
    }
}

export default ApiKeyValidationSchema;
