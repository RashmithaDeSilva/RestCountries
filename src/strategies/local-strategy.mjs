import passport from "passport";
import { Strategy } from "passport-local";
import UserService from "../services/UserService.mjs";
import DatabaseErrors from "../utils/errors/DatabaseErrors.mjs";
import HashErrors from "../utils/errors/HashErrors.mjs";
import CommonErrors from "../utils/errors/CommonErrors.mjs";
import ErrorLogService from "../services/ErrorLogService.mjs";

const userService = new UserService();
const errorLogService = new ErrorLogService();

// Take user object and store in session
passport.serializeUser((user, done) => {
    // console.log("serializeUser");
    done(null, user.id);
});

// Take data from session
passport.deserializeUser((id, done) => {
    try {
        // console.log("deserializeUser");
        const user = userService.findUser(id);
        if (!user) throw new Error(DatabaseErrors.USER_NOT_FOUND);
        done(null, user);

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
                || error.message === HashErrors.HASH_VERIFICATION_FAILED
                || error.message === DatabaseErrors.INVALID_EMAIL_ADDRESS) {
                return done(null, false, DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD);  // Expected errors
            }

            if (process.env.ENV === "DEV") {
                throw error;
            }

            await errorLogService.createLog("local-strategy.passport", error, { email });
            throw new Error(CommonErrors.INTERNAL_SERVER_ERROR); // Unexpected errors (500)
        }
    })
);

