import passport from "passport";
import { Strategy } from "passport-local";
import UserService from "../services/UserService.mjs";
import DatabaseErrors from "../utils/errors/DatabaseErrors.mjs";
import CommonErrors from "../utils/errors/CommonErrors.mjs";
import UserModel from "../models/UserModel.mjs";

const userService = new UserService();

// Take user object and store in session
passport.serializeUser((user, done) => {
    // console.log("serializeUser");
    done(null, user.id);
});

// Take data from session
passport.deserializeUser(async (id, done) => {
    try {
        // console.log("deserializeUser");
        const user = await userService.findUser(id);
        const responseUserModel = UserModel.getResponseUserModel(
            user.firstName, 
            user.surname,
            user.email,
            user.contactNumber,
            user.verify,
            user.id
        );
        if (!user) throw new Error(DatabaseErrors.USER_NOT_FOUND);
        done(null, responseUserModel);

    } catch (error) {
        done(error, null);
    }
});

export default passport.use(
    new Strategy({ usernameField: 'email' }, 
        async (email, password, done) => {
        try {
            const user = await userService.authenticateUser(email, password);
            done(null, user);

        } catch (error) {
            if (error.message === DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD 
                || error.message === DatabaseErrors.INVALID_EMAIL_ADDRESS) {
                return done(null, false, DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD);  // Expected errors
            }

            if (process.env.ENV === "DEV") {
                throw error;
            }
            return done(null, false, CommonErrors.INTERNAL_SERVER_ERROR); // Unexpected errors (500)
        }
    })
);

