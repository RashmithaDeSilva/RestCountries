import dotenv from "dotenv";

dotenv.config();
const USER_FIRST_NAME_MIN_CHARACTERS_SIZE = process.env.USER_FIRST_NAME_MIN_CHARACTERS_SIZE;
const USER_FIRST_NAME_MAX_CHARACTERS_SIZE = process.env.USER_FIRST_NAME_MAX_CHARACTERS_SIZE;
const USER_SURNAME_MIN_CHARACTERS_SIZE = process.env.USER_SURNAME_MIN_CHARACTERS_SIZE;
const USER_SURNAME_MAX_CHARACTERS_SIZE = process.env.USER_SURNAME_MAX_CHARACTERS_SIZE;
const USER_EMAIL_MIN_CHARACTERS_SIZE = process.env.USER_EMAIL_MIN_CHARACTERS_SIZE;
const USER_EMAIL_MAX_CHARACTERS_SIZE = process.env.USER_EMAIL_MAX_CHARACTERS_SIZE;
const USER_PASSWORD_MIN_CHARACTERS_SIZE = process.env.USER_PASSWORD_MIN_CHARACTERS_SIZE;




class UserValidationSchema {
    constructor() {}

    static firstNameValidation() {
        return {
            first_name: {
                notEmpty: {
                    errorMessage: {
                        error: "First name can't be empty!"
                    }
                },
                isString: {
                    errorMessage: {
                        error: "First name must be a string!"
                    }
                },
                matches: {
                    options: [/^[A-Za-z]+(?: [A-Za-z]+)?$/], // Allows only letters with a single space
                    errorMessage: {
                        error: "First name can only contain letters and a single space!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_FIRST_NAME_MIN_CHARACTERS_SIZE || 3),
                        max: parseInt(USER_FIRST_NAME_MAX_CHARACTERS_SIZE || 50)
                    },
                    errorMessage: {
                        error: `First name must be between ${ USER_FIRST_NAME_MIN_CHARACTERS_SIZE || 3 } and ${ USER_FIRST_NAME_MAX_CHARACTERS_SIZE || 50 } characters!`
                    }
                }
            }
        };
    }
    
    static surnameValidation() {
        return {
            surname: {
                notEmpty: {
                    errorMessage: {
                        error: "Surname can't be empty!"
                    }
                },
                isString: {
                    errorMessage: {
                        error: "Surname must be a string!"
                    }
                },
                matches: {
                    options: [/^[A-Za-z]+(?: [A-Za-z]+)?$/], // Allows only letters with a single space
                    errorMessage: {
                        error: "Surname can only contain letters and a single space!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_SURNAME_MIN_CHARACTERS_SIZE || 3),
                        max: parseInt(USER_SURNAME_MAX_CHARACTERS_SIZE || 50)
                    },
                    errorMessage: {
                        error: `Surname must be between ${ USER_SURNAME_MIN_CHARACTERS_SIZE || 3 } and ${ USER_SURNAME_MAX_CHARACTERS_SIZE || 50 } characters!`
                    }
                }
            }
        };
    }    

    static emailValidation() {
        return {
            email: {
                notEmpty: {
                    errorMessage: {
                        error: "Email can't be empty!"
                    }
                },
                isString: {
                    errorMessage: {
                        error: "Email must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_EMAIL_MIN_CHARACTERS_SIZE || 10),
                        max: parseInt(USER_EMAIL_MAX_CHARACTERS_SIZE || 100)
                    },
                    errorMessage: {
                        error: `Email must be between ${ USER_EMAIL_MIN_CHARACTERS_SIZE || 10 } and ${ USER_EMAIL_MAX_CHARACTERS_SIZE || 100 } characters!`
                    }
                },
                isEmail: {
                    errorMessage: {
                        error: "Invalid email format!"
                    }
                }
            }
        };
    }

    static contactNumberValidation () {
        return {
            contact_number: {
                isMobilePhone: {
                    options: 'any',
                    errorMessage: {
                        error: "Invalid phone number!"
                    }
                }
            }
        }
    }    

    static passwordValidation() {
        return {
            password: {
                notEmpty: {
                    errorMessage: {
                        error: "Password can't be empty!"
                    }
                },
                isString: {
                    errorMessage: {
                        error: "Password must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_PASSWORD_MIN_CHARACTERS_SIZE || 12)
                    },
                    errorMessage: {
                        error: `Password must be at least ${ USER_PASSWORD_MIN_CHARACTERS_SIZE || 12 } characters!`
                    }
                }
            }
        };
    }

    static confirmPasswordValidation() {
        return {
            confirm_password: {
                notEmpty: {
                    errorMessage: {
                        error: "Confirm password cannot be empty!"
                    }
                },
                isString: {
                    errorMessage: {
                        error: "Confirm password must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_PASSWORD_MIN_CHARACTERS_SIZE || 12)
                    },
                    errorMessage: {
                        error: `Confirm password must be at least ${ USER_PASSWORD_MIN_CHARACTERS_SIZE || 12 } characters!`
                    }
                },
                custom: {
                    options: (value, { req }) => value === req.body.password,
                    errorMessage: {
                        error: "Confirm password must match the password!"
                    }
                }
            }
        };
    }

    static oldPasswordValidation() {
        return {
            old_password: {
                notEmpty: {
                    errorMessage: {
                        error: "Old password cannot be empty!"
                    }
                },
                isString: {
                    errorMessage: {
                        error: "Old password must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_PASSWORD_MIN_CHARACTERS_SIZE || 12)
                    },
                    errorMessage: {
                        error: `Old password must be at least ${ USER_PASSWORD_MIN_CHARACTERS_SIZE || 12 } characters!`
                    }
                }
            }
        };
    }
}

export default UserValidationSchema;
