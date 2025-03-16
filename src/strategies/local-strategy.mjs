import passport from "passport";
import { Strategy } from "passport-local";
import UserService from "../services/UserService.mjs";
import DatabaseErrors from "../utils/errors/DatabaseErrors.mjs";
import CommonErrors from "../utils/errors/CommonErrors.mjs";
import UserModel from "../models/UserModel.mjs";

const userService = new UserService();

// Take user object and store in session
passport.serializeUser((user, done) => {;
    done(null, user.id);
});

// Take data from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userService.getUserById(id);
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
                return done(new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD), false);  // Expected errors
            }
            return done(process.env.ENV === "DEV" ? 
                error : new Error(CommonErrors.INTERNAL_SERVER_ERROR), false); // Unexpected errors (500)
        }
    })
);

